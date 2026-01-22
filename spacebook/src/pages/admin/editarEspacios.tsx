import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EspacioService } from "../../services/espacio.service";
import { StorageService } from "../../services/storage.service";
import { UserContext } from "../../context/usuario.context";
import EditarHorarios from "./components-admin/EditarHorarios";
import "../../styles/editarEspacios.css";
import "../../styles/admin.css";

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

export default function EditarEspacios() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        nombre_lugar: '',
        descripcion: '',
        tipo: '',
        ubicacion: '',
        capacidad: '',
        foto_url: null as (File | string | null),
        espacio_disponible: true
    });

  // Cargar datos del espacio
    useEffect(() => {
    const cargarEspacio = async () => {
        const data = await EspacioService.ObtenerEspacioID(id!);
        if (data) {
            setFormData({
                nombre_lugar: data.nombre_lugar,
                descripcion: data.descripcion,
                tipo: data.tipo,
                ubicacion: data.ubicacion,
                capacidad: data.capacidad.toString(),
                foto_url: data.foto_url || null,
                espacio_disponible: data.espacio_disponible ?? true
            });
        }
    };

    cargarEspacio();
  }, [id]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(""); setError("");

    let fotoPath = formData.foto_url;

    // Si la imagen se cambió
    if (formData.foto_url instanceof File) {
      const upload = await StorageService.uploadfile(formData.foto_url, user!.id);
      fotoPath = upload.path;
    }

    const updatedEspacio = {
      nombre_lugar: formData.nombre_lugar,
      descripcion: formData.descripcion,
      tipo: formData.tipo,
      ubicacion: formData.ubicacion,
      capacidad: parseInt(formData.capacidad),
      foto_url: typeof fotoPath === 'string' ? fotoPath : undefined
    };

    const result = await EspacioService.ActualizarEspacio(id!, updatedEspacio, id!, {});

    if (result) {
      setMensaje("Espacio actualizado");
      setTimeout(() => navigate("/admin"), 1500);
    } else {
      setError("No se pudo actualizar el espacio");
    }
  };

  return (
    <div className="admin-page admin-editar-espacios">

      <div className="admin-header">
        <div>
          <h2>Editar Espacio</h2>
          <p className="text-muted">Actualiza la información del espacio y sus días disponibles.</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => navigate("/admin")}>Volver</button>
      </div>

      {mensaje && <div className="alert alert-success">{mensaje}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="admin-split">
        <div className="admin-card">
          <form onSubmit={handleSubmit}>
            <label htmlFor="nombre_lugar">Nombre del Lugar</label>
            <input id="nombre_lugar" className="form-control mb-2" name="nombre_lugar" value={formData.nombre_lugar} onChange={handleChange} required />

            <label htmlFor="descripcion">Descripción</label>
            <textarea id="descripcion" className="form-control mb-2" name="descripcion" value={formData.descripcion} onChange={handleChange} required />

            <label htmlFor="tipo">Tipo</label>
            <select id="tipo" className="form-control mb-2" name="tipo" value={formData.tipo} onChange={handleChange} required>
              <option value="aula">Aula</option>
              <option value="laboratorio">Laboratorio</option>
              <option value="auditorio">Auditorio</option>
              <option value="sala">Sala de Reuniones</option>
            </select>

            <label htmlFor="ubicacion">Ubicación</label>
            <input id="ubicacion" className="form-control mb-2" name="ubicacion" value={formData.ubicacion} onChange={handleChange} required />

            <label htmlFor="capacidad">Capacidad</label>
            <input id="capacidad" className="form-control mb-2" type="number" name="capacidad" value={formData.capacidad} onChange={handleChange} required />

            <label htmlFor="foto">Foto (si quieres cambiarla)</label>
            <div className="file-upload mb-3">
              <input
                id="foto"
                className="file-upload__input"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    foto_url: e.target.files?.[0] || prev.foto_url,
                  }))
                }
              />
              <label htmlFor="foto" className="file-upload__button">
                <UploadIcon className="file-upload__icon" />
                Seleccionar archivo
              </label>
              <div className="file-upload__name" aria-live="polite">
                {formData.foto_url instanceof File ? (
                  <>
                    Archivo: <strong>{formData.foto_url.name}</strong>
                  </>
                ) : formData.foto_url ? (
                  <>Foto actual cargada</>
                ) : (
                  <>Sin archivos seleccionados</>
                )}
              </div>
            </div>

            <button className="btn btn-primary">Guardar Cambios</button>
          </form>
        </div>

        <div>
          <EditarHorarios idEspacio={id!} />
        </div>
      </div>
    </div>
  );
}
