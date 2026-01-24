const webpush = require("web-push");

function firstEnv(...names) {
	for (const name of names) {
		const value = process.env[name];
		if (typeof value === "string" && value.trim()) return value.trim();
	}
	return null;
}

const subject =
	firstEnv("VAPID_SUBJECT", "PUBLIC_VAPID_SUBJECT", "VITE_VAPID_SUBJECT") ||
	"mailto:example@yourdomain.org";

const publicKey = firstEnv(
	"PUBLIC_VAPID_KEY",
	"VAPID_PUBLIC_KEY",
	"VITE_VAPID_PUBLIC_KEY",
	"VITE_PUBLIC_VAPID_KEY"
);

const privateKey = firstEnv(
	"PRIVATE_VAPID_KEY",
	"VAPID_PRIVATE_KEY",
	"VITE_PRIVATE_VAPID_KEY",
	"VITE_VAPID_PRIVATE_KEY"
);

let enabled = false;

if (publicKey && privateKey) {
	try {
		webpush.setVapidDetails(subject, publicKey, privateKey);
		enabled = true;
	} catch (err) {
		console.warn(
			"[webpush] VAPID inválido; push deshabilitado.",
			err?.message || err
		);
	}
} else {
	console.warn(
		"[webpush] Faltan VAPID keys; push deshabilitado. Setea PUBLIC_VAPID_KEY/PRIVATE_VAPID_KEY (o VITE_VAPID_PUBLIC_KEY/VITE_PRIVATE_VAPID_KEY)."
	);
}

async function sendNotification(subscription, payload, options) {
	if (!enabled) {
		// Feature para que no se caiga el servidor
		return { disabled: true };
	}
	return webpush.sendNotification(subscription, payload, options);
}

module.exports = { enabled, sendNotification };