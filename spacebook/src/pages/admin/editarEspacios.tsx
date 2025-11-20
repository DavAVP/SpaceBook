import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EspacioService } from "../../services/espacio.service";
import { StorageService } from "../../services/storage.service";
import { UserContext } from "../../context/usuario.context";
import EditarHorarios from "./components-admin/EditarHorarios";
import "../../styles/editarEspacios.css";

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
    <div className="container mt-5">
      <h2>Editar Espacio</h2>

      {mensaje && <div className="alert alert-success">{mensaje}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <label>Nombre del Lugar</label>
        <input className="form-control mb-2" name="nombre_lugar" value={formData.nombre_lugar} onChange={handleChange} required />

        <label>Descripción</label>
        <textarea className="form-control mb-2" name="descripcion" value={formData.descripcion} onChange={handleChange} required />

        <label>Tipo</label>
        <select className="form-control mb-2" name="tipo" value={formData.tipo} onChange={handleChange} required>
          <option value="aula">Aula</option>
          <option value="laboratorio">Laboratorio</option>
          <option value="auditorio">Auditorio</option>
          <option value="sala">Sala de Reuniones</option>
        </select>

        <label>Ubicación</label>
        <input className="form-control mb-2" name="ubicacion" value={formData.ubicacion} onChange={handleChange} required />

        <label>Capacidad</label>
        <input className="form-control mb-2" type="number" name="capacidad" value={formData.capacidad} onChange={handleChange} required />

        <label>Foto (si quieres cambiarla)</label>
        <input className="form-control mb-3" type="file" onChange={(e) => setFormData(prev => ({ ...prev, foto_url: e.target.files?.[0] || prev.foto_url }))} />
        <div>
            <hr />
            <EditarHorarios  idEspacio ={id!}/>
        </div>
        <button className="btn btn-primary">Guardar Cambios</button>
      </form>
    </div>
  );
}
