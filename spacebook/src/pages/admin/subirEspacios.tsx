import React, { useState, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { EspacioService } from "../../services/espacio.service";
import { UserContext } from '../../context/usuario.context';
import { StorageService } from "../../services/storage.service";
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
                            <select
                                className="form-control"
                                id="tipo"
                                name="tipo"
                                value={formData.tipo}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Seleccione un tipo</option>
                                <option value="aula">Aula</option>
                                <option value="laboratorio">Laboratorio</option>
                                <option value="auditorio">Auditorio</option>
                                <option value="sala">Sala de Reuniones</option>
                            </select>
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
