function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return new Uint8Array([...rawData].map(c => c.charCodeAt(0)));
}

export async function Suscripcion(user?: {id: string, is_admin: boolean}) {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        const register = await navigator.serviceWorker.ready;
        const suscripcion = await register.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
                (import.meta.env.VITE_VAPID_PUBLIC_KEY)
            )
        });

        await fetch('http://localhost:8080/subscription', {
            method: 'POST',
            body: JSON.stringify({
                ...suscripcion.toJSON(),
                userId: user?.id || null,
                role: user?.is_admin ? 'admin' : 'cliente'
            }),
            headers: {'content-type': 'application/json'}
        });

        console.log('Usuario suscrito correctamente');
    } else {
        console.log('Push notificacion no soporta');
    }
}
