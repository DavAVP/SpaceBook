import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { EspacioService } from "../../services/espacio.service";
import { UserContext } from '../../context/usuario.context';
import { StorageService } from "../../services/storage.service";
import { CategoriaService } from "../../services/categoria.service";
import type { ICategoria } from "../../interfaces/Categoria";
import "../../styles/espacios.css";
import "../../styles/admin.css";
import AgregarHorario from "./components-admin/horarioDisponible";

function UploadIcon(props: { className?: string }) {
    return (
        <svg
            className={props.className}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="M12 3v10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M8 7l4-4 4 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M4 14v4a3 3 0 003 3h10a3 3 0 003-3v-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

export default function SubirEspacios() {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const [mensaje, setMensaje] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [idCreado, setIdCreado] = useState<string | null>(null);
    const [categorias, setCategorias] = useState<ICategoria[]>([]);
    const [categoriasCargando, setCategoriasCargando] = useState(true);
    const [categoriaError, setCategoriaError] = useState<string>('');
    const [categoriaMensaje, setCategoriaMensaje] = useState<string>('');
    const [categoriaForm, setCategoriaForm] = useState({
        nombre: '',
        descripcion: ''
    });
    const [mostrarGestionCategorias, setMostrarGestionCategorias] = useState(false);
    const [categoriaEditando, setCategoriaEditando] = useState<ICategoria | null>(null);
    const [guardandoCategoria, setGuardandoCategoria] = useState(false);
    const [categoriaEliminando, setCategoriaEliminando] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        nombre_lugar: '',
        descripcion: '',
        tipo: '',
        ubicacion: '',
        capacidad: '',
        foto_url: null as File | null,
        espacio_disponible: true
    });

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    useEffect(() => {
        let mounted = true;

        const cargarCategorias = async () => {
            setCategoriasCargando(true);
            try {
                const data = await CategoriaService.obtenerCategorias();
                if (!mounted) return;
                const ordenadas = [...data].sort((a, b) => a.nombre.localeCompare(b.nombre));
                setCategorias(ordenadas);
            } catch (err) {
                console.error('Error cargando categorías', err);
                if (mounted) setCategorias([]);
            } finally {
                if (mounted) setCategoriasCargando(false);
            }
        };

        cargarCategorias();
        return () => { mounted = false; };
    }, []);

    const handleCategoriaInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCategoriaError('');
        setCategoriaMensaje('');
        setCategoriaForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetFormularioCategoria = () => {
        setCategoriaForm({ nombre: '', descripcion: '' });
        setCategoriaEditando(null);
    };

    const cerrarGestionCategorias = () => {
        setMostrarGestionCategorias(false);
        setCategoriaError('');
        setCategoriaMensaje('');
        resetFormularioCategoria();
    };

    const handleGuardarCategoria = async () => {
        const nombre = categoriaForm.nombre.trim();
        const descripcion = categoriaForm.descripcion.trim();
        setCategoriaError('');
        setCategoriaMensaje('');

        if (!nombre) {
            setCategoriaError('Ingresa un nombre para la categoría.');
            return;
        }

        const existe = categorias.some(cat => {
            if (categoriaEditando && cat.id_categoria === categoriaEditando.id_categoria) {
                return false;
            }
            return cat.nombre.toLowerCase() === nombre.toLowerCase();
        });
        if (existe) {
            setCategoriaError('Ya existe una categoría con ese nombre.');
            return;
        }

        setGuardandoCategoria(true);
        try {
            if (categoriaEditando) {
                const actualizada = await CategoriaService.actualizarCategoria(categoriaEditando.id_categoria, { nombre, descripcion });
                if (!actualizada) {
                    setCategoriaError('No se pudo actualizar la categoría.');
                    return;
                }

                setCategorias(prev => prev
                    .map(cat => cat.id_categoria === actualizada.id_categoria ? actualizada : cat)
                    .sort((a, b) => a.nombre.localeCompare(b.nombre))
                );
                if (formData.tipo === categoriaEditando.nombre) {
                    setFormData(prev => ({ ...prev, tipo: actualizada.nombre }));
                }
                setCategoriaMensaje('Categoría actualizada correctamente.');
            } else {
                const nuevaCategoria = await CategoriaService.crearCategoria({ nombre, descripcion });
                if (!nuevaCategoria) {
                    setCategoriaError('No se pudo crear la categoría.');
                    return;
                }

                setCategorias(prev => [...prev, nuevaCategoria].sort((a, b) => a.nombre.localeCompare(b.nombre)));
                setFormData(prev => ({ ...prev, tipo: nuevaCategoria.nombre }));
                setCategoriaMensaje('Categoría creada correctamente.');
            }

            resetFormularioCategoria();
        } catch (err) {
            console.error('Error creando categoría', err);
            setCategoriaError('Error inesperado al guardar la categoría.');
        } finally {
            setGuardandoCategoria(false);
        }
    };

    const handleEditarCategoria = (categoria: ICategoria) => {
        setMostrarGestionCategorias(true);
        setCategoriaEditando(categoria);
        setCategoriaForm({
            nombre: categoria.nombre,
            descripcion: categoria.descripcion ?? '',
        });
        setCategoriaError('');
        setCategoriaMensaje('');
    };

    const handleEliminarCategoria = async (categoria: ICategoria) => {
        if (!window.confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) {
            return
        }

        setCategoriaError('');
        setCategoriaMensaje('');
        setCategoriaEliminando(categoria.id_categoria);

        try {
            const eliminado = await CategoriaService.eliminarCategoria(categoria.id_categoria);
            if (!eliminado) {
                setCategoriaError('No se pudo eliminar la categoría.');
                return;
            }

            setCategorias(prev => prev
                .filter(cat => cat.id_categoria !== categoria.id_categoria)
                .sort((a, b) => a.nombre.localeCompare(b.nombre))
            );

            if (formData.tipo === categoria.nombre) {
                setFormData(prev => ({ ...prev, tipo: '' }));
            }

            if (categoriaEditando && categoriaEditando.id_categoria === categoria.id_categoria) {
                resetFormularioCategoria();
            }

            setCategoriaMensaje('Categoría eliminada correctamente.');
        } catch (err) {
            console.error('Error eliminando categoría', err);
            setCategoriaError('Error inesperado al eliminar la categoría.');
        } finally {
            setCategoriaEliminando(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setMensaje('');

        try {
            const id_espacio = crypto.randomUUID();
            let fotoPath: string | undefined = undefined;

            if (formData.foto_url instanceof File){
                const upload = await StorageService.uploadfile(formData.foto_url, user.id);
                fotoPath = upload.path
                const publicUrl = await StorageService.uploadfile(formData.foto_url, user.id);
                fotoPath = publicUrl.url
            }

            const nuevoEspacio = {
                id_espacio,
                nombre_lugar: formData.nombre_lugar,
                descripcion: formData.descripcion,
                tipo: formData.tipo,
                ubicacion: formData.ubicacion,
                capacidad: parseInt(formData.capacidad),
                foto_url: fotoPath,
                espacio_disponible: true
            };

            const resultado = await EspacioService.crearEspacio(nuevoEspacio);

            if (resultado) {
                setMensaje('Espacio creado exitosamente');
                setFormData({
                    nombre_lugar: '',
                    descripcion: '',
                    tipo: '',
                    ubicacion: '',
                    capacidad: '',
                    foto_url: null,
                    espacio_disponible: true
                });
                setIdCreado(id_espacio);
            } else {
                setError('No se pudo crear el espacio');
            }
        } catch (error) {
            setError('Error al crear el espacio');
            console.error(error);
        }
    };

    return (
        <div className="admin-page admin-subir-espacios">
        <div className="container-mt-5">
            <div className="admin-header">
                <div>
                    <h2 className="mb-2">Subir Nuevo Espacio</h2>
                    <p className="text-muted">Crea un espacio y luego configura sus días disponibles.</p>
                </div>
                <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => navigate('/admin')}
                >
                    Volver al Panel
                </button>
            </div>
            
            {mensaje && <div className="alert alert-success">{mensaje}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="admin-split">
                <div className="admin-card">
                    <form onSubmit={handleSubmit} className="space-form">
                        <div className="mb-3">
                            <label htmlFor="nombre_lugar" className="form-label">Nombre del Lugar</label>
                            <input
                                type="text"
                                className="form-control"
                                id="nombre_lugar"
                                name="nombre_lugar"
                                value={formData.nombre_lugar}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="descripcion" className="form-label">Descripción</label>
                            <textarea
                                className="form-control"
                                id="descripcion"
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="tipo" className="form-label">Tipo de Espacio</label>
                            <div className="category-select">
                                <div className="category-select__control">
                                    <select
                                        className="form-control"
                                        id="tipo"
                                        name="tipo"
                                        value={formData.tipo}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">
                                            {categoriasCargando ? 'Cargando categorías...' : 'Seleccione una categoría'}
                                        </option>
                                        {categorias.map((categoria) => (
                                            <option key={categoria.id_categoria} value={categoria.nombre}>
                                                {categoria.nombre}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        className="category-select__toggle"
                                        onClick={() => {
                                            if (mostrarGestionCategorias) {
                                                cerrarGestionCategorias();
                                            } else {
                                                setMostrarGestionCategorias(true);
                                                setCategoriaError('');
                                                setCategoriaMensaje('');
                                                resetFormularioCategoria();
                                            }
                                        }}
                                    >
                                        {mostrarGestionCategorias ? 'Ocultar gestión de categorías' : 'Gestionar categorías'}
                                    </button>
                                </div>
                                {!categoriasCargando && categorias.length === 0 && (
                                    <small className="category-select__hint">
                                        Crea una categoría para poder asignarla al espacio.
                                    </small>
                                )}
                                {mostrarGestionCategorias && (
                                    <div className="category-select__form">
                                        <div className="mb-2">
                                            <label htmlFor="categoria-nombre" className="form-label">Nombre</label>
                                            <input
                                                id="categoria-nombre"
                                                name="nombre"
                                                type="text"
                                                className="form-control"
                                                value={categoriaForm.nombre}
                                                onChange={handleCategoriaInputChange}
                                                placeholder="Ej. Laboratorio"
                                            />
                                        </div>
                                        <div className="mb-2">
                                            <label htmlFor="categoria-descripcion" className="form-label">Descripción (opcional)</label>
                                            <textarea
                                                id="categoria-descripcion"
                                                name="descripcion"
                                                className="form-control"
                                                value={categoriaForm.descripcion}
                                                onChange={handleCategoriaInputChange}
                                                rows={2}
                                            />
                                        </div>
                                        {categoriaError && (
                                            <div className="alert alert-danger py-2" role="alert">
                                                {categoriaError}
                                            </div>
                                        )}
                                        {categoriaMensaje && (
                                            <div className="alert alert-success py-2" role="alert">
                                                {categoriaMensaje}
                                            </div>
                                        )}
                                        <div className="category-select__actions">
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={handleGuardarCategoria}
                                                disabled={guardandoCategoria}
                                            >
                                                {guardandoCategoria
                                                    ? 'Guardando...'
                                                    : categoriaEditando
                                                        ? 'Actualizar categoría'
                                                        : 'Crear categoría'}
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={cerrarGestionCategorias}
                                                disabled={guardandoCategoria}
                                            >
                                                Cerrar
                                            </button>
                                        </div>
                                        {categorias.length > 0 && (
                                            <ul className="category-select__list">
                                                {categorias.map((categoria) => (
                                                    <li key={categoria.id_categoria} className="category-select__item">
                                                        <div className="category-select__item-info">
                                                            <strong>{categoria.nombre}</strong>
                                                            {categoria.descripcion && (
                                                                <p>{categoria.descripcion}</p>
                                                            )}
                                                        </div>
                                                        <div className="category-select__item-actions">
                                                            <button
                                                                type="button"
                                                                className="btn btn-secondary btn-sm"
                                                                onClick={() => handleEditarCategoria(categoria)}
                                                                disabled={guardandoCategoria || categoriaEliminando === categoria.id_categoria}
                                                            >
                                                                Editar
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => handleEliminarCategoria(categoria)}
                                                                disabled={categoriaEliminando === categoria.id_categoria}
                                                            >
                                                                {categoriaEliminando === categoria.id_categoria ? 'Eliminando...' : 'Eliminar'}
                                                            </button>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="ubicacion" className="form-label">Ubicación</label>
                            <input
                                type="text"
                                className="form-control"
                                id="ubicacion"
                                name="ubicacion"
                                value={formData.ubicacion}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="capacidad" className="form-label">Capacidad</label>
                            <input
                                type="number"
                                className="form-control"
                                id="capacidad"
                                name="capacidad"
                                value={formData.capacidad}
                                onChange={handleInputChange}
                                min="1"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="foto_url" className="form-label">Foto</label>
                            <div className="file-upload">
                                <input
                                    type="file"
                                    className="file-upload__input"
                                    id="foto_url"
                                    name="foto_url"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            foto_url: e.target.files?.[0] || null,
                                        }))
                                    }
                                />
                                <label htmlFor="foto_url" className="file-upload__button">
                                    <UploadIcon className="file-upload__icon" />
                                    Seleccionar archivo
                                </label>
                                <div className="file-upload__name" aria-live="polite">
                                    {formData.foto_url ? (
                                        <>
                                            Archivo: <strong>{formData.foto_url.name}</strong>
                                        </>
                                    ) : (
                                        <>Sin archivos seleccionados</>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mb-3">
                            <button type="submit" className="btn btn-primary">
                                Crear Espacio
                            </button>
                        </div>
                    </form>
                </div>

                <div>
                    {idCreado ? (
                        <AgregarHorario
                            idEspacio={idCreado}
                            onFinish={() => navigate('/admin')}
                        />
                    ) : (
                        <div className="admin-card admin-placeholder">
                            <h4>Configurar días</h4>
                            <p className="text-muted">Después de crear el espacio, aquí podrás seleccionar sus días disponibles.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </div>
    );
}