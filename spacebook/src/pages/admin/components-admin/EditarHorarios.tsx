import { useEffect, useState } from "react";
import { HoraDisponibleService } from "../../../services/horaDisponible.service";
import AgregarHorario from "./horarioDisponible";
import "../../../styles/editarHorarios.css";

interface Props {
  idEspacio: string;
}

export default function EditarHorarios({ idEspacio }: Props) {
  const [horarios, setHorarios] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);

  const cargarHorarios = async () => {
    const data = await HoraDisponibleService.ObtenerHoraDisponibles();
    if (data) {
      setHorarios(data.filter(h => h.espacio_id === idEspacio));
    }
  };

  useEffect(() => {
    cargarHorarios();
  }, [idEspacio]);

  const actualizarHorario = async (horario: any) => {
    const actualizado = await HoraDisponibleService.ActualizarHorario(horario.id_horario, {
      dia_semana: horario.dia_semana,
      horario_apertura: horario.horario_apertura,
      horario_cierre: horario.horario_cierre
    });

    if (actualizado) {
      setMensaje("Horario actualizado");
      setTimeout(() => setMensaje(""), 2000);
    }
  };

  const eliminarHorario = async (id_horario: string) => {
    const confirmar = confirm("¿Eliminar este horario?");
    if (!confirmar) return;
    
    const eliminado = await HoraDisponibleService.EliminarHorario(id_horario);
    if (eliminado) {
      setHorarios(prev => prev.filter(h => h.id_horario !== id_horario));
      setMensaje("Horario eliminado");
      setTimeout(() => setMensaje(""), 2000);
    }
  };

  const cambiarValor = (id_horario: string, field: string, value: string) => {
    setHorarios(prev =>
      prev.map(h => h.id_horario === id_horario ? { ...h, [field]: value } : h)
    );
  };

  const handleFinishAgregar = () => {
    setMostrarForm(false);
    cargarHorarios();
  };

  return (
    <div className="editar-horarios-container">
      <h4>Editar Horarios</h4>
      {mensaje && <div className="alert alert-success">{mensaje}</div>}

      <button 
        className="btn-toggle-form"
        onClick={() => setMostrarForm(!mostrarForm)}
      >
        {mostrarForm ? "Cerrar" : "Agregar Horario"}
      </button>

      {mostrarForm && (
        <AgregarHorario 
          idEspacio={idEspacio} 
          onFinish={handleFinishAgregar}
        />
      )}

      {horarios.length === 0 && (<div className = "no-horarios">
        No hay horarios registrados.
        </div>
      )}

      {horarios.map(h => (
        <div key={h.id_horario} className="horario-card">
          <label>Día</label>
          <input
            value={h.dia_semana}
            onChange={(e) => cambiarValor(h.id_horario, "dia_semana", e.target.value)}
            className="form-control mb-2"
          />

          <label>Hora inicio</label>
          <input
            type="time"
            value={h.horario_apertura}
            onChange={(e) => cambiarValor(h.id_horario, "horario_apertura", e.target.value)}
            className="form-control mb-2"
          />

          <label>Hora fin</label>
          <input
            type="time"
            value={h.horario_cierre}
            onChange={(e) => cambiarValor(h.id_horario, "horario_cierre", e.target.value)}
            className="form-control mb-3"
          />
          <div className = "horario-card-buttons">
            <button
              className="btn btn-success btn-sm me-2"
              onClick={() => actualizarHorario(h)}
            >
              Guardar cambios
            </button>

            <button
              className="btn btn-danger btn-sm"
              onClick={() => eliminarHorario(h.id_horario)}
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
