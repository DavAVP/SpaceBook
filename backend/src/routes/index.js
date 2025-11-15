const { Router } = require('express');
const router = Router();
const webPush = require('../webpush');

// AQUÍ guardamos todas las suscripciones
let pushSubscription = [];

// ----------- RECIBIR SUSCRIPCIÓN ---------------
router.post('/subscription', async (req, res) => {
    const sub = req.body;

    if (!sub || !sub.endpoint) {
        return res.status(400).json({ error: "Suscripción inválida" });
    }

    // evitar repetidos
    const existe = pushSubscription.find(s => s.endpoint === sub.endpoint);
    if (!existe) {
        pushSubscription.push({
            ...sub,
            role: req.body.role || 'cliente',  // 'admin' o 'cliente'
            userId: req.body.userId || null,   // id del usuario
        });
        console.log("Nueva suscripción agregada.");
    } else {
        console.log("La suscripción ya existía.");
    }

    console.log("Suscripciones actuales:", pushSubscription.length);
    return res.status(200).json({ ok: true });
});

// ----------- ENVIAR NOTIFICACIONES ---------------
router.post('/new-message', async (req, res) => {
    const { message, role = 'admin', userId = null } = req.body; 
    // role: a quién va dirigida ('admin' o 'cliente')
    // userId: si quieres enviar a un usuario específico

    if (!message) {
        return res.status(400).json({ error: "Falta el mensaje" });
    }

    // Filtrar suscriptores según rol o userId
    let destinatarios = [];
    if (userId) {
        destinatarios = pushSubscription.filter(sub => sub.userId === userId);
    } else {
        destinatarios = pushSubscription.filter(sub => sub.role === role);
    }

    if (destinatarios.length === 0) {
        console.log('No hay suscriptores para este mensaje.');
        return res.status(400).json({ error: 'No hay suscriptores registrados para este rol/usuario' });
    }

    const payload = JSON.stringify({
        title: 'SpaceBook',
        message,
    });

    console.log(`Enviando notificación a ${destinatarios.length} suscriptor(es)`);

    destinatarios.forEach(async (sub, index) => {
        try {
            await webPush.sendNotification(sub, payload);
            console.log(`Notificación enviada al suscriptor #${index + 1} -> role: ${sub.role}, userId: ${sub.userId}`);
        } catch (error) {
            console.error("Error enviando:", error);
            if (error.statusCode === 410) {
                pushSubscription = pushSubscription.filter(s => s.endpoint !== sub.endpoint);
                console.log("Se eliminó una suscripción expirada.");
            }
        }
    });

    return res.status(200).json({ success: true });
});

// backend/routes/penalizacion.js
router.post('/new-penalization-admin', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Falta el mensaje" });

  // Filtrar solo suscriptores admin
  const destinatarios = pushSubscription.filter(sub => sub.role === 'admin');
  if (destinatarios.length === 0) {
    return res.status(400).json({ error: 'No hay admins suscritos' });
  }

  const payload = JSON.stringify({ title: 'SpaceBook - Penalización', message });

  destinatarios.forEach(async (sub, index) => {
    try {
      await webPush.sendNotification(sub, payload);
      console.log(`Notificación enviada al admin #${index + 1} -> userId: ${sub.userId}`);
    } catch (error) {
      console.error("Error enviando:", error);
      if (error.statusCode === 410) {
        pushSubscription = pushSubscription.filter(s => s.endpoint !== sub.endpoint);
      }
    }
  });

  res.status(200).json({ success: true });
});


module.exports = router;
