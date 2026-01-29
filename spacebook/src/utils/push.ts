function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return new Uint8Array([...rawData].map(c => c.charCodeAt(0)));
}

export async function Suscripcion(user?: {id: string, is_admin: boolean}) {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        
        const ApiKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
        if(!ApiKey){
            throw new Error("error")
            return
        }
        
        const register = await navigator.serviceWorker.ready;
        const suscripcion = await register.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(ApiKey)
        });

        const payloadJson = suscripcion.toJSON();
        if(!payloadJson?.endpoint || !payloadJson?.keys?.p256dh){
            console.warn('Suscripcion invalida, no se envian al backend')
            return;
        }
        
        const res = await fetch(`${import.meta.env.VITE_API_URL}/subscription`, {     
            method: 'POST',
            body: JSON.stringify({
                ...payloadJson,
                userId: user?.id || null,
                role: user?.is_admin ? 'admin' : 'cliente'
            }),
            headers: {'content-type': 'application/json'}
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("Error al guardar la suscripción:", text);
            return;
        }
    } else {
        console.warn('Push notifications no soportadas en el navegador actual');
    }
}
