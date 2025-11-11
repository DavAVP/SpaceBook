import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { IEspacio } from "../../interfaces/Espacio";
import type { IHorarioDisponible } from "../../interfaces/Horario_disponible";
import { EspacioService } from "../../services/espacio.service";
import { HoraDisponibleService } from "../../services/horaDisponible.service";
import "../../styles/reservar.css";
import { useUser } from "../../context/usuario.context";
import { ReservaService } from "../../services/reserva.service";

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
          // Filtrar solo los del espacio actual
          const horariosFiltrados = horariosData.filter((h) => h.espacio_id === id);
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
      alert("Debes iniciar sesión para reservar.");
      return;
    }
    const horario = horarios.find(h => String(h.id_horario) === String(horarioId));
    if (!horario) {
      alert("Horario inválido.");
      return;
    }

    const reservaPayload = {
      usuario_id: user.id,
      espacio_id: espacio_id,
      hora_inicio: horario.horario_apertura,
      hora_fin: horario.horario_cierre,
      estado: "confirmada",
      fecha_reserva: new Date().toISOString(),
      fecha_cancelacion: null
    };

    try {
      const nuevaReserva = await ReservaService.crearReserva(reservaPayload);
      if (!nuevaReserva) throw new Error("No se pudo crear la reserva");

      const actualizado = await EspacioService.cambiarDisponibilidad(espacio_id, false);
      if (!actualizado) throw new Error("No se pudo actualizar la disponibilidad");

      alert("Reserva creada correctamente!");
      navigate("/home");
    } catch (error) {
      console.error(error);
      alert("Hubo un error al crear la reserva");
    }
  };

  return (
    <div className="reservar-container">
      <h1>Reservar Espacio</h1>

      <div className="espacio-details">
        <img 
        src={espacio.foto_url} 
        alt={espacio.nombre_lugar} />
        
        <p><strong>Nombre:</strong> {espacio.nombre_lugar}</p>
        <p><strong>Descripción:</strong> {espacio.descripcion}</p>
        <p><strong>Capacidad:</strong> {espacio.capacidad}</p>
      </div>

      <h2>Horarios Disponibles</h2>
      {horarios.length > 0 ? (
        <ul className="horarios-list">
          {horarios.map((horario) => (
            <li key={horario.id_horario}>
              <p>
                🗓️ {horario.dia_semana} — ⏰ {horario.horario_apertura} a {horario.horario_cierre}
              </p>
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