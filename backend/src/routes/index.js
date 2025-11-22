const { Router } = require('express');
const router = Router();
const webPush = require('../webpush');

// Guardamos las suscripciones en memoria
let pushSubscriptions = [];

function normalizeRole(payload) {
    if (typeof payload.role === 'string') {
        const r = payload.role.toLowerCase();
        return r === 'admin' ? 'admin' : 'cliente';
    }
    if (payload.is_admin === true || payload.isAdmin === true) return 'admin';
    if (payload.is_admin === false || payload.isAdmin === false) return 'cliente';
    if (typeof payload.role === 'boolean') return payload.role ? 'admin' : 'cliente';
    return 'cliente';
}

// Endpoint para recibir una suscripción
router.post('/subscription', async (req, res) => {
    try {
        const sub = req.body;
        if (!sub || !sub.endpoint) {
            return res.status(400).json({ error: "Suscripción inválida" });
        }
        // normalizar role y userId
        const role = normalizeRole(sub);
        const userId = sub.userId || sub.user_id || null;

        const existe = pushSubscriptions.find(s => s.endpoint === sub.endpoint);
        if (!existe) {
            pushSubscriptions.push({
                ...sub,
                role,
                userId,
                createdAt: new Date().toISOString(),
            });
            console.log("Nueva suscripción agregada ->", { endpoint: sub.endpoint, role, userId });
        } else {
            existe.role = role;
            existe.userId = userId;
            existe.createdAt = new Date().toISOString();
            console.log("Suscripción existente actualizada ->", { endpoint: sub.endpoint, role, userId });
        }
        console.log("Suscripciones actuales:", pushSubscriptions.length);
        return res.status(200).json({ ok: true });
    } catch (e) {
        console.error("Error /subscription:", e);
        return res.status(500).json({ error: "Error interno" });
    }
});

// Enviar notificaciones
router.post('/new-message', async (req, res) => {
    try {
        const { message, role: rawRole, userId = null, title = 'SpaceBook' } = req.body;
        if (!message) return res.status(400).json({ error: "Falta el mensaje" });

        const role = rawRole ? normalizeRole({ role: rawRole }) : null;
        let destinatarios = [];
        if (userId) {
            destinatarios = pushSubscriptions.filter(sub => String(sub.userId) === String(userId));
        } else if (role) {
            destinatarios = pushSubscriptions.filter(sub => sub.role === role);
        }
        if (destinatarios.length === 0) {
            console.log('No hay suscriptores para este mensaje.', { userId, role });
            return res.status(400).json({ error: 'No hay suscriptores registrados para este rol/usuario' });
        }
        const payload = JSON.stringify({ title, message });
        console.log(`Enviando notificación a ${destinatarios.length} suscriptor(es)`);
        const results = await Promise.allSettled(destinatarios.map(sub => webPush.sendNotification(sub, payload)));

        // manejar resultados
        results.forEach((r, idx) => {
            const sub = destinatarios[idx];
            if (r.status === 'fulfilled') {
                console.log(`Notificación enviada -> endpoint: ${sub.endpoint}, role: ${sub.role}, userId: ${sub.userId}`);
            } else {
                const err = r.reason;
                console.error(`Error enviando a ${sub.endpoint}:`, err && (err.stack || err.message || err));
                // si expiró, eliminar
                if (err && err.statusCode === 410) {
                pushSubscriptions = pushSubscriptions.filter(s => s.endpoint !== sub.endpoint);
                console.log("Se eliminó una suscripción expirada:", sub.endpoint);
                }
            }
        });
        
        return res.status(200).json({ success: true, sent: destinatarios.length });
    } catch (error) {
        console.error("Error /new-message:", error);
        return res.status(500).json({ error: "Error interno al enviar notificaciones" });
    }
});

router.post('/new-reservation-admin', async (req, res) => {
    try {
        const { message, title = 'Nueva Reserva' } = req.body;

        if (!message) return res.status(400).json({ error: "Falta el mensaje" });

        const destinatarios = pushSubscriptions.filter(sub => sub.role === 'admin');

        if (destinatarios.length === 0) {
            console.log("No hay admins suscritos para reserva.");
            return res.status(400).json({ error: "No hay admins suscritos" });
        }

        const payload = JSON.stringify({ title, message });

        console.log(`Notificando a ${destinatarios.length} admin(s) sobre una nueva reserva.`);

        const results = await Promise.allSettled(
            destinatarios.map(sub => webPush.sendNotification(sub, payload))
        );

        results.forEach((r, idx) => {
            const sub = destinatarios[idx];
            if (r.status === 'fulfilled') {
                console.log(`Notificación enviada a admin -> ${sub.endpoint}`);
            } else {
                const err = r.reason;
                console.error(`Error notificando reserva a admin ${sub.endpoint}:`,
                    err && (err.stack || err.message || err)
                );
            }
        });

        return res.status(200).json({ success: true, sent: destinatarios.length });

    } catch (error) {
        console.error("Error en /new-reservation-admin:", error);
        return res.status(500).json({ error: "Error interno" });
    }
});


// Endpoint específico para notificar admins sobre penalizaciones (no tocar)
router.post('/new-penalization-admin', async (req, res) => {
    try {
        const { message, title = 'SpaceBook - Penalización' } = req.body;
        if (!message) return res.status(400).json({ error: "Falta el mensaje" });
        const destinatarios = pushSubscriptions.filter(sub => sub.role === 'admin');

        if (destinatarios.length === 0) {
            console.log("No hay admins suscritos para enviar penalización.");
            return res.status(400).json({ error: "No hay admins suscritos" });
        }

        const payload = JSON.stringify({ title, message });
        console.log(`Enviando penalización a ${destinatarios.length} admin(s)`);

        const results = await Promise.allSettled(
            destinatarios.map(sub => webPush.sendNotification(sub, payload))
        );

        results.forEach((r, idx) => {
            const sub = destinatarios[idx];
            if (r.status === 'fulfilled') {
                console.log(`Notificación enviada a admin -> ${sub.endpoint}`);
            } else {
                const err = r.reason;
                console.error(`Error enviando penalización a admin ${sub.endpoint}:`,
                    err && (err.stack || err.message || err)
                );

                if (err && err.statusCode === 410) {
                    pushSubscriptions = pushSubscriptions.filter(s => s.endpoint !== sub.endpoint);
                    console.log("Suscripción admin expirada eliminada:", sub.endpoint);
                }
            }
        });

        return res.status(200).json({ success: true, sent: destinatarios.length });

    } catch (error) {
        console.error("Error en /new-penalization-admin:", error);
        return res.status(500).json({ error: "Error interno" });
    }
});

router.get('/subscriptions', (res) => {
    return res.json(pushSubscriptions.map(s => ({ endpoint: s.endpoint, role: s.role, userId: s.userId })));
});

router.post('/subscription/remove', (req, res) => {
    const { endpoint } = req.body;
    if (!endpoint) return res.status(400).json({ error: 'Se requiere endpoint' });
    const prev = pushSubscriptions.length;
    pushSubscriptions = pushSubscriptions.filter(s => s.endpoint !== endpoint);
    return res.json({ removed: prev - pushSubscriptions.length });
});

module.exports = router;
