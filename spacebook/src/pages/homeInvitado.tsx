import React, { useEffect, useState } from "react";
import type { IEspacio } from "../interfaces/Espacio";
import { EspacioService } from "../services/espacio.service";
import { useNavigate } from "react-router-dom"; 
import "../styles/home.css";

const HomeInvitado: React.FC = () => {
    const [espacios, setEspacios] = useState<IEspacio[]>([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    console.log("[HomeInvitado] Component loaded");

    useEffect(() => {
        let mounted = true;

        const fetchEspacios = async () => {
            console.log("[HomeInvitado] fetchEspacios start");
            try {
                const datos = await EspacioService.ObtenerEspacios();
                console.log("[HomeInvitado] ObtenerEspacios result:", datos);
                if (!mounted) return;
                setEspacios(Array.isArray(datos) ? datos : []);
            } catch (err) {
                console.error("[HomeInvitado] Error cargando espacios:", err);
                if (mounted) setEspacios([]);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchEspacios();
        return () => { mounted = false; };
    }, []);

    const handleReservarClick = (idEspacio: string) => {
        console.log(`[HomeInvitado] Intento de reserva - Espacio: ${idEspacio}`);

        navigate("/login")
    };

    if (loading) return <p>Cargando...</p>;

    return (
        <div>
            <div className="home-page">
                <h1>Bienvenido a SpaceBooks</h1>
                <p>El sitio donde nunca perderás tiempo por una reservación!</p>
                <p className="invitado-mensaje">
                    <strong>¡Inicia sesión para reservar tus espacios favoritos!</strong>
                </p>
            </div>

            <div className="espacios-grid">
                <h2>Catálogo de Espacios</h2>
                {espacios.filter(espacio => espacio.espacio_disponible).map((espacio) => (
                    <div key={espacio.id_espacio} className="espacio-card">
                        <img 
                            src={espacio.foto_url || 'https://via.placeholder.com/150'} 
                            alt={espacio.nombre_lugar} 
                            className="espacio-imagen" 
                        />
                        <h3>{espacio.nombre_lugar}</h3>
                        <p>{espacio.descripcion}</p>
                        <p className="ubicacion"><em>{espacio.ubicacion}</em></p>
                        <button 
                            className="reservar-button" 
                            onClick={() => handleReservarClick(espacio.id_espacio)}
                        >
                            Reservar
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default HomeInvitado;