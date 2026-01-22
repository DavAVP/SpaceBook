import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { IEspacio } from "../../interfaces/Espacio";
import { EspacioService } from "../../services/espacio.service";
import "../../styles/home.css"
import "../../styles/admin.css";
import { useUser } from "../../context/usuario.context";
import { toast } from "react-toastify";

const PanelAdmin: React.FC = () => {
    const [espacios, setEspacios] = useState<IEspacio[]>([]);
    const { user, loading } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        const cargarEspacios = async () => {
            const espaciosData = await EspacioService.ObtenerEspacios();
            if (espaciosData) {
                setEspacios(espaciosData);
            }
        };
        cargarEspacios();
    }, []);
    if (loading){
        return <p>Cargando...</p>
    }

    // Verificar si el usuario es admin
    if (!user?.is_admin) {
        return (
            <div className="admin-page">
                <div className="container mt-5">
                    <div className="alert alert-danger">
                        No tienes permiso para acceder a esta página
                    </div>
                </div>
            </div>
        );
    }
    const eliminarEspacio = async (id_espacio: string, espacio_id:string)=> {
        const confirmar =  confirm('Estas seguro con borrar este espacio')
        if (!confirmar)return;

        const eliminado = await EspacioService.EliminarEspacio(id_espacio, espacio_id);
        if(eliminado){
            setEspacios(prev => prev.filter(e => e.id_espacio !== id_espacio));
            toast.success("Espacio eliminado correctamente");
        }else{
            toast.error("No se pudo eliminar el espacio");
        }
    }
    

    return(
        <div className="admin-page admin-panel">
            <div className="home-page">
                <h1> Bienvenido a panel del admin </h1>
                <p> El sitio donde nunca perderás tiempo por una reservacion!</p>
                <button 
                    className="btn btn-primary mb-4"
                    onClick={() => navigate('/admin/subir-espacios')}
                >
                    Crear Nuevo Espacio
                </button>
            </div>
            <div className="espacios-grid"> 
                <h2>Catálogo de Espacios</h2>
                {espacios.filter(espacio => espacio.espacio_disponible).map((espacio) => (
                    <div key={espacio.id_espacio} className="espacio-card">
                            <img src={espacio.foto_url || 'https://placehold.co/150x150'} alt={espacio.nombre_lugar} className="espacio-imagen" />
                        <h3>{espacio.nombre_lugar}</h3>
                        <p className="espacio-descripcion">{espacio.descripcion}</p>
                        <p className="ubicacion">
                            <em>{espacio.ubicacion}</em>
                        </p>
                        <div className="admin-actions">
                            <button
                              className="btn btn-secondary"
                              onClick={() => navigate(`/admin/editar-espacios/${espacio.id_espacio}`)}
                            >
                              Editar
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() => eliminarEspacio(espacio.id_espacio, espacio.id_espacio)}
                            >
                              Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default PanelAdmin;