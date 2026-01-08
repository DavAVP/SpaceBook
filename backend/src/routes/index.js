const { Router } = require("express");
const router = Router();
const webPush = require("../webpush");
const supabase = require("../supabase");

function normalizeRole(payload) {
    if (typeof payload.role === "string") {
        const r = payload.role.toLowerCase();
        return r === "admin" ? "admin" : "cliente";
    }
    if (payload.is_admin === true || payload.isAdmin === true) return "admin";
    if (payload.is_admin === false || payload.isAdmin === false) return "cliente";
    if (typeof payload.role === "boolean") return payload.role ? "admin" : "cliente";
    return "cliente";
}

router.post("/subscription", async (req, res) => {
    try {
        const sub = req.body;

        if (!sub || !sub.endpoint || !sub.keys) {
            return res.status(400).json({ error: "Suscripción inválida" });
        }

        const role = normalizeRole(sub);
        const userId = sub.userId || sub.user_id || null;

        const { data: exists, error: existsError } = await supabase
            .from("push_subscriptions")
            .select("*")
            .eq("endpoint", sub.endpoint)
            .single();

        if (existsError && existsError.code !== "PGRST116") {
            console.error("Supabase error buscando suscripción", existsError);
            throw new Error("No se pudo consultar la suscripción");
        }

        if (!exists) {
            const { error: insertError } = await supabase
                .from("push_subscriptions")
                .insert([
                {
                    endpoint: sub.endpoint,
                    p256dh: sub.keys.p256dh,
                    auth: sub.keys.auth,
                    role,
                    user_id: userId ? String(userId) : null,
                },
            ]);

            if (insertError) {
                console.error("Supabase error creando suscripción", insertError);
                throw new Error("No se pudo guardar la suscripción");
            }

            console.log("Nueva suscripción guardada en Supabase", {
                endpoint: sub.endpoint,
                role,
                userId,
            });
        } else {
            const { error: updateError } = await supabase
                .from("push_subscriptions")
                .update({
                    p256dh: sub.keys.p256dh,
                    auth: sub.keys.auth,
                    role,
                    user_id: userId ? String(userId) : null,
                    created_at: new Date().toISOString(),
                })
                .eq("endpoint", sub.endpoint);

            if (updateError) {
                console.error("Supabase error actualizando suscripción", updateError);
                throw new Error("No se pudo actualizar la suscripción");
            }

            console.log("Suscripción actualizada en Supabase", {
                endpoint: sub.endpoint,
                role,
                userId,
            });
        }

        return res.status(200).json({ ok: true });
    } catch (error) {
        console.error("Error /subscription:", error);
        return res.status(500).json({ error: "Error interno" });
    }
});

async function getSubscriptions({ role = null, userId = null }) {
    let query = supabase.from("push_subscriptions");
    if (userId) query = query.eq("user_id", String(userId).trim());
    if (!userId && role) query = query.eq("role", role);
    const { data, error } = await query.select("*");
    if (error) {
        console.error("Supabase error obteniendo suscripciones", { role, userId, error });
        throw new Error("No se pudieron obtener las suscripciones");
    }
    return data || [];
}

function splitValidSubscriptions(subscriptions = []) {
    const valid = [];
    const invalidEndpoints = [];

    for (const sub of subscriptions) {
        if (sub && sub.endpoint && sub.p256dh && sub.auth) {
            valid.push(sub);
        } else if (sub?.endpoint) {
            invalidEndpoints.push(sub.endpoint);
        }
    }

    return { valid, invalidEndpoints };
}

async function purgeSubscriptions(endpoints = []) {
    if (!Array.isArray(endpoints) || endpoints.length === 0) return;
    try {
        const deleteBuilder = supabase.from("push_subscriptions").delete();
        if (typeof deleteBuilder.in === "function") {
            const { error } = await deleteBuilder.in("endpoint", endpoints);
            if (error) {
                throw error;
            }
        } else {
            for (const endpoint of endpoints) {
                const { error } = await supabase
                    .from("push_subscriptions")
                    .delete()
                    .eq("endpoint", endpoint);
                if (error) throw error;
            }
        }
        console.log("Suscripciones inválidas eliminadas:", endpoints);
    } catch (err) {
        console.error("No se pudieron eliminar suscripciones inválidas:", err);
    }
}

async function dispatchNotifications(subscriptions = [], payload) {
    const { valid, invalidEndpoints } = splitValidSubscriptions(subscriptions);

    if (invalidEndpoints.length) await purgeSubscriptions(invalidEndpoints);

    if (valid.length === 0) {
        return { sent: 0, attempted: 0 };
    }

    const results = await Promise.allSettled(
        valid.map((sub) =>
            Promise.resolve().then(() =>
                webPush.sendNotification(
                    {
                        endpoint: sub.endpoint,
                        keys: { p256dh: sub.p256dh, auth: sub.auth },
                    },
                    payload
                )
            )
        )
    );

    const expiredEndpoints = [];
    let sent = 0;

    results.forEach((result, idx) => {
        if (result.status === "fulfilled") {
            sent += 1;
            return;
        }

        const err = result.reason;
        if (err && err.statusCode === 410) {
            expiredEndpoints.push(valid[idx].endpoint);
        } else {
            console.error("Error enviando notificación push:", err);
        }
    });

    if (expiredEndpoints.length) await purgeSubscriptions(expiredEndpoints);

    return { sent, attempted: valid.length };
}

router.post("/new-message", async (req, res) => {
    try {
        const { message, role: rawRole, userId = null, title = "SpaceBook" } = req.body;

        if (!message) return res.status(400).json({ error: "Falta el mensaje" });
        const role = rawRole ? normalizeRole({ role: rawRole }) : null;
        console.log("/new-message body", { role, userId, title });
        const destinatarios = await getSubscriptions({ role, userId });
        const { sent, attempted } = await dispatchNotifications(
            destinatarios,
            JSON.stringify({ title, message })
        );

        console.log("/new-message result", { attempted, sent });
        if (attempted === 0) {
            return res.status(200).json({ success: true, sent: 0 });
        }

        return res.status(200).json({ success: true, sent });
    } catch (error) {
        console.error("Error /new-message:", error);
        return res.status(500).json({ error: error?.message || "Error interno" });
    }
});

router.post("/new-reservation-admin", async (req, res) => {
    try {
        const { message, title = "Nueva Reserva" } = req.body;

        if (!message) return res.status(400).json({ error: "Falta el mensaje" });

        console.log("/new-reservation-admin body", { title });
        const destinatarios = await getSubscriptions({ role: "admin" });
        const { sent, attempted } = await dispatchNotifications(
            destinatarios,
            JSON.stringify({ title, message })
        );

        console.log("/new-reservation-admin result", { attempted, sent });
        if (attempted === 0) {
            return res.status(400).json({ error: "No hay admins suscritos" });
        }

        return res.status(200).json({ success: true, sent });
    } catch (error) {
        console.error("Error en /new-reservation-admin:", error);
        return res.status(500).json({ error: error?.message || "Error interno" });
    }
});

router.post("/new-penalization-admin", async (req, res) => {
    try {
        const { message, title = "SpaceBook - Penalización" } = req.body;

        if (!message) return res.status(400).json({ error: "Falta el mensaje" });

        console.log("/new-penalization-admin body", { title });
        const destinatarios = await getSubscriptions({ role: "admin" });
        const { sent, attempted } = await dispatchNotifications(
            destinatarios,
            JSON.stringify({ title, message })
        );

        console.log("/new-penalization-admin result", { attempted, sent });
        if (attempted === 0) {
            return res.status(400).json({ error: "No hay admins suscritos" });
        }

        return res.status(200).json({ success: true, sent });
    } catch (error) {
        console.error("Error en /new-penalization-admin:", error);
        return res.status(500).json({ error: error?.message || "Error interno" });
    }
});

router.get("/subscriptions", async (req, res) => {
    const { data } = await supabase
        .from("push_subscriptions")
        .select("endpoint, role, user_id");

    res.json(data);
});

router.post("/subscription/remove", async (req, res) => {
    let { endpoint } = req.body;

    if (!endpoint) {
        return res.status(400).json({ error: "Se requiere endpoint" });
    }

    endpoint = String(endpoint).trim();

    const { data, error } = await supabase
        .from("push_subscriptions")
        .delete()
        .eq("endpoint", endpoint)
        .select("*", { count: "exact" });

    if (error) {
        console.error("Error eliminando suscripción:", error);
        return res.status(500).json({ error: "Error eliminando la suscripción" });
    }

    return res.json({ removed: data?.length || 0 });
});
// Exportar el router
module.exports = router;
