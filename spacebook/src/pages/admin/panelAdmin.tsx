import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { IEspacio } from "../../interfaces/Espacio";
import { EspacioService } from "../../services/espacio.service";
import type { ICategoria } from "../../interfaces/Categoria";
import { CategoriaService } from "../../services/categoria.service";
import "../../styles/home.css"
import "../../styles/admin.css";
import { useUser } from "../../context/usuario.context";
import { toast } from "react-toastify";

const PanelAdmin: React.FC = () => {
    const [espacios, setEspacios] = useState<IEspacio[]>([]);
    const [categorias, setCategorias] = useState<ICategoria[]>([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('todas');
    const [categoriasCargando, setCategoriasCargando] = useState(true);
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

    useEffect(() => {
        let mounted = true;

        const cargarCategorias = async () => {
            setCategoriasCargando(true);
            try {
                const datos = await CategoriaService.obtenerCategorias();
                if (!mounted) return;
                const ordenadas = [...datos].sort((a, b) => a.nombre.localeCompare(b.nombre));
                setCategorias(ordenadas);
            } catch (err) {
                console.error('[PanelAdmin] Error cargando categorías:', err);
                if (mounted) setCategorias([]);
            } finally {
                if (mounted) setCategoriasCargando(false);
            }
        };

        cargarCategorias();
        return () => { mounted = false; };
    }, []);

    const categoriasDisponibles = useMemo(() => {
        const nombres = new Set<string>();
        categorias.forEach(cat => {
            if (cat.nombre) nombres.add(cat.nombre);
        });
        espacios.forEach(espacio => {
            if (espacio.tipo) nombres.add(espacio.tipo);
        });
        return Array.from(nombres).sort((a, b) => a.localeCompare(b));
    }, [categorias, espacios]);

    const espaciosDisponibles = useMemo(() => (
        espacios.filter(espacio => espacio.espacio_disponible)
    ), [espacios]);

    const espaciosFiltrados = useMemo(() => {
        if (categoriaSeleccionada === 'todas') {
            return espaciosDisponibles;
        }
        return espaciosDisponibles.filter(espacio => espacio.tipo === categoriaSeleccionada);
    }, [espaciosDisponibles, categoriaSeleccionada]);

    const handleCategoriaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setCategoriaSeleccionada(event.target.value);
    };

    useEffect(() => {
        if (
            categoriaSeleccionada !== 'todas' &&
            !categoriasDisponibles.includes(categoriaSeleccionada)
        ) {
            setCategoriaSeleccionada('todas');
        }
    }, [categoriaSeleccionada, categoriasDisponibles]);

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
                <div className="catalog-toolbar">
                    <h2>Catálogo de Espacios</h2>
                    <div className="catalog-toolbar__group">
                        <label htmlFor="filtro-categoria-admin" className="catalog-toolbar__label">
                            Filtrar por categoría
                        </label>
                        <select
                            id="filtro-categoria-admin"
                            className="catalog-toolbar__select"
                            value={categoriaSeleccionada}
                            onChange={handleCategoriaChange}
                            disabled={categoriasCargando && categoriasDisponibles.length === 0}
                        >
                            <option value="todas">Todas</option>
                            {categoriasDisponibles.map(nombre => (
                                <option key={nombre} value={nombre}>{nombre}</option>
                            ))}
                        </select>
                    </div>
                </div>
                {espaciosFiltrados.length === 0 ? (
                    <div className="no-espacios">
                        <p>{categoriaSeleccionada === 'todas' ? 'No hay espacios disponibles por el momento.' : 'No hay espacios asignados a esta categoría.'}</p>
                    </div>
                                ) : (
                                        espaciosFiltrados.map((espacio) => (
                                                <div key={espacio.id_espacio} className="espacio-card">
                                                                <img src={espacio.foto_url || 'https://placehold.co/150x150'} alt={espacio.nombre_lugar} className="espacio-imagen" />
                                                        {espacio.tipo && (
                                                                <span className="espacio-categoria">{espacio.tipo}</span>
                                                        )}
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
                                        ))
                                )}
            </div>
        </div>
    )
}

export default PanelAdmin;