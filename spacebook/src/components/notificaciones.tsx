import React, { useEffect, useState } from "react";
import { Suscripcion } from "../utils/push";

interface Props {
    userId: string;
    is_admin: boolean;
}

const NotificationToggle: React.FC<Props> = ({ userId, is_admin }) => {
    const [enabled, setEnabled] = useState<boolean>(false);

    useEffect(() => {
        const saved = localStorage.getItem("notificaciones_activadas");
        setEnabled(saved === "true");
    }, []);

    const activar = async () => {
        await Suscripcion({ id: userId, is_admin });
        localStorage.setItem("notificaciones_activadas", "true");
        setEnabled(true);
    };

    const desactivar = async () => {
        const register = await navigator.serviceWorker.ready;
        const subscription = await register.pushManager.getSubscription();

        if (subscription) {
            const endpoint = subscription.endpoint;

            // Anular en el navegador
            await subscription.unsubscribe();

            // Avisar al backend
            await fetch(`${import.meta.env.VITE_API_URL}/subscription/remove`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ endpoint })
            });
        }

        localStorage.removeItem("notificaciones_activadas");
        setEnabled(false);
    };

    const toggle = () => {
        if (enabled) desactivar();
        else activar();
    };

    return (
        <button className="dropdown-item notification-toggle" onClick={toggle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                {enabled ? (
                    <>
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </>
                ) : (
                    <>
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <line x1="2" y1="2" x2="22" y2="22"></line>
                    </>
                )}
            </svg>
            <span>{enabled ? "Desactivar Notificaciones" : "Activar Notificaciones"}</span>
        </button>
    );
};

export default NotificationToggle;
