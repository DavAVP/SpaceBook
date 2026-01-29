import React, { useEffect, useMemo, useState } from "react";
import type { IEspacio } from "../../interfaces/Espacio";
import { EspacioService } from "../../services/espacio.service";
import type { ICategoria } from "../../interfaces/Categoria";
import { CategoriaService } from "../../services/categoria.service";
import "../../styles/home.css";
import { useUser } from "../../context/usuario.context";

const Home: React.FC = () => {
    const [espacios, setEspacios] = useState<IEspacio[]>([]);
    const [categorias, setCategorias] = useState<ICategoria[]>([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('todas');
    const [categoriasCargando, setCategoriasCargando] = useState(true);
    const { loading } = useUser();

    useEffect(() => {
        let mounted = true;

        const fetchEspacios = async () => {
            try {
                const datos = await EspacioService.ObtenerEspacios();
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

    useEffect(() => {
        let mounted = true;

        const fetchCategorias = async () => {
            setCategoriasCargando(true);
            try {
                const datos = await CategoriaService.obtenerCategorias();
                if (!mounted) return;
                const ordenadas = [...datos].sort((a, b) => a.nombre.localeCompare(b.nombre));
                setCategorias(ordenadas);
            } catch (err) {
                console.error('[Home Clientes] Error cargando categorías:', err);
                if (mounted) setCategorias([]);
            } finally {
                if (mounted) setCategoriasCargando(false);
            }
        };

        fetchCategorias();
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

    const textoFiltroActivo = categoriaSeleccionada !== 'todas'
        ? 'No hay espacios disponibles en esta categoría por ahora.'
        : 'No hay espacios disponibles por el momento.';

    useEffect(() => {
        if (
            categoriaSeleccionada !== 'todas' &&
            !categoriasDisponibles.includes(categoriaSeleccionada)
        ) {
            setCategoriaSeleccionada('todas');
        }
    }, [categoriaSeleccionada, categoriasDisponibles]);

    const handleCategoriaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setCategoriaSeleccionada(event.target.value);
    };

    if (loading && espacios.length === 0) return <p>Cargando...</p>;

    return(
        <div>
            <div className="home-page">
                <h1> Bienvenido a SpaceBooks</h1>
                <p> El sitio donde nunca perderás tiempo por una reservacion!</p>
            </div>

            <div className="espacios-grid">
                <div className="catalog-toolbar">
                    <h2>Catálogo de Espacios</h2>
                    <div className="catalog-toolbar__group">
                        <label htmlFor="filtro-categoria-clientes" className="catalog-toolbar__label">
                            Filtrar por categoría
                        </label>
                        <select
                            id="filtro-categoria-clientes"
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
                        <p>{textoFiltroActivo}</p>
                    </div>
                ) : (
                    espaciosFiltrados.map((espacio) => (
                        <div key={espacio.id_espacio} className="espacio-card">
                            <img 
                                src={espacio.foto_url || 'https://via.placeholder.com/150'} 
                                alt={espacio.nombre_lugar} 
                                className="espacio-imagen" 
                            />
                            {espacio.tipo && (
                                <span className="espacio-categoria">{espacio.tipo}</span>
                            )}
                            <h3>{espacio.nombre_lugar}</h3>
                            <p className="espacio-descripcion">{espacio.descripcion}</p>
                            <p className="ubicacion"><em>{espacio.ubicacion}</em></p>
                            <button className="reservar-button" onClick={() => window.location.href = `/reservar/${espacio.id_espacio}`}>Reservar</button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default Home;