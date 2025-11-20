import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { IEspacio } from "../../interfaces/Espacio";
import type { IHorarioDisponible } from "../../interfaces/Horario_disponible";
import { EspacioService } from "../../services/espacio.service";
import { HoraDisponibleService } from "../../services/horaDisponible.service";
import "../../styles/reservar.css";
import { toast } from "react-toastify";
import { useUser } from "../../context/usuario.context";
import { ReservaService } from "../../services/reserva.service";
import { PenalizacionService } from "../../services/penalizacion.service";
import { NotificacionServices } from "../../services/notificacion.service";

const Reservar: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // ID del espacio
  const [espacio, setEspacio] = useState<IEspacio | null>(null);
  const [horarios, setHorarios] = useState<IHorarioDisponible[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensajeError, setMensajeError] = useState<string>("");
  const { user } = useUser();
  const [selectedHorarioId, setSelectedHorarioId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        if (!id) {
          setLoading(false);
          return;
        }

        const espacioData = await EspacioService.ObtenerEspacioID(id);
        if (!espacioData) throw new Error("Espacio no encontrado");
        setEspacio(espacioData);

        const horariosData = await HoraDisponibleService.ObtenerHoraDisponibles();
        if (horariosData) {
          // Filtrar solo los del espacio actual y que no estén ocupados
          const horariosFiltrados = horariosData.filter(
            (h) => h.espacio_id === id && !h.ocupado
          );
          setHorarios(horariosFiltrados);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error cargando datos:", error);
        setMensajeError("No se pudieron cargar los datos del espacio.");
        setLoading(false);
      }
    };

    fetchDatos();
  }, [id]);

  if (loading) return <p>Cargando espacio...</p>;
  if (!espacio) return <p>No se encontró el espacio.</p>;

  const handleReservar = async (espacio_id: string, horarioId: string) => {
    if (!user) {
      toast.info("Debes iniciar sesión para reservar.");
      return;
    }
    
    // Bloqueo por penalización
    const penalizado = await PenalizacionService.usuarioEstaPenalizado(user.id);
    console.log("¿Penalizado?:", penalizado);
    if (penalizado) {
      toast.error("No puedes realizar reservas mientras estés penalizado!");
      return;
    }


    const horario = horarios.find(h => String(h.id_horario) === String(horarioId));
    if (!horario) {
      toast.error("Horario inválido.");
      return;
    }

    const reservaPayload = {
      usuario_id: user.id,
      espacio_id: espacio_id,
      horario_id: horarioId,
      hora_inicio: horario.horario_apertura,
      hora_fin: horario.horario_cierre,
      estado: "pendiente",
      fecha_reserva: new Date().toISOString(),
    };

    try {
      const nuevaReserva = await ReservaService.crearReserva(reservaPayload);
      if (!nuevaReserva) throw new Error("No se pudo crear la reserva");

      // notificacion
      await fetch('http://localhost:8080/new-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Tienes una reserva pendiente para ${espacio.nombre_lugar}. ¡Confírmala!` })
      });

      // guardamos notificacion en el supabase
      await NotificacionServices.crearNotificacion({
        id_notificacion: crypto.randomUUID(),
        usuario_id: user.id,
        reserva_id: String(nuevaReserva.id_reserva),
        mensaje: `Tienes una reserva pendiente para ${espacio.nombre_lugar}. ¡Confírmala!`,
        fecha_envio: new Date().toISOString(),
      });

      const horariosRestantes = await HoraDisponibleService.ObtenerHoraDisponibles();
      const horariosValidos = Array.isArray(horariosRestantes) ? horariosRestantes : [];

      const horariosDelEspacio = horariosValidos.filter(
        (h) => h.espacio_id === espacio_id && !h.ocupado
      );

      setHorarios(horariosDelEspacio);

      // Si ya no hay horarios libres, marcar el espacio como no disponible
      if (horariosDelEspacio.length === 0) {
        const actualizado = await EspacioService.cambiarDisponibilidad(espacio_id, false);
        if (!actualizado) throw new Error("No se pudo actualizar la disponibilidad");
      }

      setHorarios(prev => prev.filter(h => String(h.id_horario) !== horarioId));
      setSelectedHorarioId(null);

      toast.success("Reserva creada correctamente!");
      navigate("/home");
    } catch (error: any) {
      console.error("Error detallado al crear reserva:", error);
      if (error?.message?.includes("ocupado") || error?.toString().includes("ocupado")) {
      toast.error("Ese horario ya fue reservado, elige otro horario.");
    } else {
      toast.error("Hubo un error al crear la reserva: " + (error.message || error));
    }
    }
  };

  return (
    <div className="reservar-container">
      <h1>Reservar Espacio</h1>

      <div className="espacio-details">
        <img src={espacio.foto_url} alt={espacio.nombre_lugar} />
        <p><strong>Nombre:</strong> {espacio.nombre_lugar}</p>
        <p><strong>Descripción:</strong> {espacio.descripcion}</p>
        <p><strong>Capacidad:</strong> {espacio.capacidad}</p>
      </div>

      <h2>Horarios Disponibles</h2>
      {horarios.length > 0 ? (
        <ul className="horarios-list">
          {horarios.map((horario) => (
            <li key={horario.id_horario}>
              <p>{horario.dia_semana} —{horario.horario_apertura} a {horario.horario_cierre}</p>
              <label>
                <input
                  type="radio"
                  name="horario"
                  value={String(horario.id_horario)}
                  checked={selectedHorarioId === String(horario.id_horario)}
                  onChange={() => setSelectedHorarioId(String(horario.id_horario))}
                />
                Seleccionar
              </label>
              <button
                className="btn-reservar"
                onClick={() => handleReservar(espacio.id_espacio, String(horario.id_horario))}
              >
                Reservar
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay horarios disponibles para este espacio.</p>
      )}

      {mensajeError && <p className="error-message">{mensajeError}</p>}
    </div>
  );
};

export default Reservar;