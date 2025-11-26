export async function Suscripcion(user?: {id: string, is_admin: boolean}) {
    console.log(' VITE_API_URL:', import.meta.env.VITE_API_URL);
    
    if ('serviceWorker' in navigator && 'PushManager' in window) {

        const register = await navigator.serviceWorker.ready;
        const suscripcion = await register.pushManager.subscribe({
            userVisibleOnly: true
        });

        const payloadJson = suscripcion.toJSON();
        if (!payloadJson?.endpoint || !payloadJson?.keys?.p256dh) {
            console.log(' Suscripcion invalida, no se envian al backend');
            return;
        }
        
        const apiUrl = import.meta.env.VITE_API_URL;
        if (!apiUrl) {
            console.error(" VITE_API_URL no está configurada");
            throw new Error("VITE_API_URL no está configurada");
        }

        console.log(' Enviando suscripción a:', `${apiUrl}/subscription`);
        
        const res = await fetch(`${apiUrl}/subscription`, {     
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

        console.log(' Usuario suscrito correctamente');
        
    } else {
        console.log('Push notifications no soportadas');
    }
}
