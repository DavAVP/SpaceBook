import React, { useEffect, useState } from "react";
import type { IEspacio } from "../../interfaces/Espacio";
import { EspacioService } from "../../services/espacio.service";
import "../../styles/home.css";
import { useUser } from "../../context/usuario.context";

const Home: React.FC = () => {
    const [espacios, setEspacios] = useState<IEspacio[]>([]);
    const { user, loading } = useUser();

    console.log("[Home] useUser:", { user, loading });
    console.log("[Home module] loaded"); 

    useEffect(() => {
        let mounted = true;

        const fetchEspacios = async () => {
            console.log("[Home] fetchEspacios start");
            try {
                const datos = await EspacioService.ObtenerEspacios();
                console.log("[Home] ObtenerEspacios result:", datos);
                if (!mounted) return;
                setEspacios(Array.isArray(datos) ? datos : []);
            } catch (err) {
                console.error("[Home] Error cargando espacios:", err);
                if (mounted) setEspacios([]);
            }
        };

        fetchEspacios();
        return () => { mounted = false; };
    }, []);

    if (loading && espacios.length === 0) return <p>Cargando...</p>;

    return(
        <div>
            <div className="home-page">
                <h1> Bienvenido a SpaceBook </h1>
                <p> El sitio donde nunca perderás tiempo por una reservacion!</p>
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
                        <button className="reservar-button" onClick={() => window.location.href = `/reservar/${espacio.id_espacio}`}>Reservar</button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Home;