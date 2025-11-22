import { useEffect, useState } from "react";
import { HoraDisponibleService } from "../../../services/horaDisponible.service";
import "../../../styles/editarHorarios.css";

interface Props {
  idEspacio: string;
}

export default function EditarHorarios({ idEspacio }: Props) {
  const [diasActivos, setDiasActivos] = useState<string[]>([]);
  const [horariosOriginales, setHorariosOriginales] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const ListaDiaSemana = [
    'lunes',
    'martes',
    'miercoles',
    'jueves',
    'viernes',
    'sabado',
    'domingo', 
  ];

  const cargarHorarios = async () => {
    const data = await HoraDisponibleService.ObtenerHoraDisponibles();
    if (data) {
      const horariosEspacio = data.filter(h => h.espacio_id === idEspacio);
      setHorariosOriginales(horariosEspacio);
      setDiasActivos(horariosEspacio.map(h => h.dia_semana));
    }
  };

  useEffect(() => {
    cargarHorarios();
  }, [idEspacio]);

  const toggleDia = (dia: string) => {
    setDiasActivos(prev => 
      prev.includes(dia) 
        ? prev.filter(d => d !== dia)
        : [...prev, dia]
    );
  };

  const guardarCambios = async () => {
    setCargando(true);
    setMensaje("");

    try {
      // Días que estaban pero ya no están = ELIMINAR
      const diasAEliminar = horariosOriginales.filter(
        h => !diasActivos.includes(h.dia_semana)
      );

      // Días que están ahora pero no estaban antes = AGREGAR
      const diasOriginales = horariosOriginales.map(h => h.dia_semana);
      const diasAAgregar = diasActivos.filter(dia => !diasOriginales.includes(dia));

      // Eliminar días
      for (const horario of diasAEliminar) {
        await HoraDisponibleService.EliminarHorario(horario.id_horario);
      }

      // Agregar nuevos días
      for (const dia of diasAAgregar) {
        const nuevoHorario = {
          id_horario: crypto.randomUUID(),
          espacio_id: idEspacio,
          dia_semana: dia,
          horario_apertura: "00:00",
          horario_cierre: "23:59",
          ocupado: false
        };
        await HoraDisponibleService.crearHoraDisponible(nuevoHorario);
      }

      setMensaje("Cambios guardados correctamente");
      await cargarHorarios();
      
      setTimeout(() => setMensaje(""), 3000);
    } catch (error) {
      console.error("Error al guardar:", error);
      setMensaje("Error al guardar los cambios");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="editar-horarios-container">
      <h4>Editar Días Disponibles</h4>
      <p className="text-muted">Selecciona los días en que este espacio estará disponible para reservas</p>
      
      {mensaje && (
        <div className={`alert ${mensaje.includes("Error") ? "alert-danger" : "alert-success"}`}>
          {mensaje}
        </div>
      )}

      <div className="dias-container mb-4">
        {ListaDiaSemana.map((dia) => (
          <div key={dia} className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id={`dia-${dia}`}
              checked={diasActivos.includes(dia)}
              onChange={() => toggleDia(dia)}
              disabled={cargando}
            />
            <label className="form-check-label" htmlFor={`dia-${dia}`}>
              {dia.charAt(0).toUpperCase() + dia.slice(1)}
            </label>
          </div>
        ))}
      </div>

      <button 
        className="btn btn-primary"
        onClick={guardarCambios}
        disabled={cargando || diasActivos.length === 0}
      >
        {cargando ? "Guardando..." : "Guardar dias disponibles"}
      </button>

      {diasActivos.length === 0 && (
        <p className="text-warning mt-2">⚠️ Debes seleccionar al menos un día</p>
      )}
    </div>
  );
}