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

        const { data: exists } = await supabase
            .from("push_subscriptions")
            .select("*")
            .eq("endpoint", sub.endpoint)
            .maybeSingle();

        if (!exists) {
            // nueva suscripción
            await supabase.from("push_subscriptions").insert([
                {
                    endpoint: sub.endpoint,
                    p256dh: sub.keys.p256dh,
                    auth: sub.keys.auth,
                    role,
                    user_id: userId ? String(userId) : null,
                },
            ]);

            console.log("Nueva suscripción guardada en Supabase →", {
                endpoint: sub.endpoint,
                role,
                userId,
            });
        } else {
            // actualizar suscripción existente
            await supabase
                .from("push_subscriptions")
                .update({
                    p256dh: sub.keys.p256dh,
                    auth: sub.keys.auth,
                    role,
                    user_id: userId ? String(userId) : null,
                    created_at: new Date().toISOString(),
                })
                .eq("endpoint", sub.endpoint);

            console.log("Suscripción actualizada en Supabase →", {
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
    let query = supabase.from("push_subscriptions").select("*");

    if (userId) query = query.eq("user_id", String(userId));
    if (!userId && role) query = query.eq("role", role);

    const { data } = await query;
    return data || [];
}

router.post("/new-message", async (req, res) => {
    try {
        const { message, role: rawRole, userId = null, title = "SpaceBook" } = req.body;

        if (!message) return res.status(400).json({ error: "Falta el mensaje" });

        const role = rawRole ? normalizeRole({ role: rawRole }) : null;

        const destinatarios = await getSubscriptions({ role, userId });

        if (destinatarios.length === 0) {
            return res.status(200).json({ success: true, sent: 0 });
        }

        const payload = JSON.stringify({ title, message });

        const results = await Promise.allSettled(
            destinatarios.map((sub) =>
                webPush.sendNotification(
                    {
                        endpoint: sub.endpoint,
                        keys: { p256dh: sub.p256dh, auth: sub.auth },
                    },
                    payload
                )
            )
        );

        // eliminar expiradas
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const sub = destinatarios[i];

            if (result.status === "rejected") {
                const err = result.reason;
                if (err && err.statusCode === 410) {
                    await supabase
                        .from("push_subscriptions")
                        .delete()
                        .eq("endpoint", sub.endpoint);

                    console.log("Suscripción expirada eliminada:", sub.endpoint);
                }
            }
        }

        return res.status(200).json({ success: true, sent: destinatarios.length });
    } catch (error) {
        console.error("Error /new-message:", error);
        return res.status(500).json({ error: "Error interno" });
    }
});

router.post("/new-reservation-admin", async (req, res) => {
    try {
        const { message, title = "Nueva Reserva" } = req.body;

        if (!message) return res.status(400).json({ error: "Falta el mensaje" });

        const destinatarios = await getSubscriptions({ role: "admin" });

        if (destinatarios.length === 0) {
            return res.status(400).json({ error: "No hay admins suscritos" });
        }

        const payload = JSON.stringify({ title, message });

        await Promise.allSettled(
            destinatarios.map((sub) =>
                webPush.sendNotification(
                    {
                        endpoint: sub.endpoint,
                        keys: { p256dh: sub.p256dh, auth: sub.auth },
                    },
                    payload
                )
            )
        );

        return res.status(200).json({ success: true, sent: destinatarios.length });
    } catch (error) {
        console.error("Error en /new-reservation-admin:", error);
        return res.status(500).json({ error: "Error interno" });
    }
});

router.post("/new-penalization-admin", async (req, res) => {
    try {
        const { message, title = "SpaceBook - Penalización" } = req.body;

        if (!message) return res.status(400).json({ error: "Falta el mensaje" });

        const destinatarios = await getSubscriptions({ role: "admin" });

        if (destinatarios.length === 0) {
            return res.status(400).json({ error: "No hay admins suscritos" });
        }

        const payload = JSON.stringify({ title, message });

        await Promise.allSettled(
            destinatarios.map((sub) =>
                webPush.sendNotification(
                    {
                        endpoint: sub.endpoint,
                        keys: { p256dh: sub.p256dh, auth: sub.auth },
                    },
                    payload
                )
            )
        );

        return res.status(200).json({ success: true, sent: destinatarios.length });
    } catch (error) {
        console.error("Error en /new-penalization-admin:", error);
        return res.status(500).json({ error: "Error interno" });
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

    const { error, count } = await supabase
        .from("push_subscriptions")
        .delete()
        .eq("endpoint", endpoint)
        .select();

    if (error) {
        console.error("Error eliminando suscripción:", error);
        return res.status(500).json({ error: "Error eliminando la suscripción" });
    }

    return res.json({ removed: count || 0 });
});

module.exports = router;
