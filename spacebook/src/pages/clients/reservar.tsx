import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { IEspacio } from "../../interfaces/Espacio";
import { EspacioService } from "../../services/espacio.service";
import { HoraDisponibleService } from "../../services/horaDisponible.service";
import "../../styles/reservar.css";
import { toast } from "react-toastify";
import { useUser } from "../../context/usuario.context";
import { ReservaService } from "../../services/reserva.service";
import { PenalizacionService } from "../../services/penalizacion.service";
import { NotificacionServices } from "../../services/notificacion.service";
import { supabase } from "../../api/supabase.config";

const Reservar: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [espacio, setEspacio] = useState<IEspacio | null>(null);
  const [diasDisponibles, setDiasDisponibles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensajeError, setMensajeError] = useState<string>("");
  const { user } = useUser();
  const navigate = useNavigate();

  // Estados para el formulario de reserva
  const [diaSeleccionado, setDiaSeleccionado] = useState<string>("");
  const [horaInicio, setHoraInicio] = useState<string>("");
  const [horaFin, setHoraFin] = useState<string>("");
  const [horariosOcupados, setHorariosOcupados] = useState<any[]>([]);

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
          // Obtener solo los días disponibles para este espacio
          const diasDelEspacio = horariosData
            .filter(h => h.espacio_id === id)
            .map(h => h.dia_semana);
          
          // Eliminar duplicados
          const diasUnicos = [...new Set(diasDelEspacio)];
          setDiasDisponibles(diasUnicos);
        }

        //Obtener reservas existentes del espacio
        const {data: reservas} = await supabase
          .from("Reserva")
          .select(`*, HorarioDisponible!inner(dia_semana)`)
          .eq("espacio_id", id)
          .in("estado", ["pendiente", "confirmada"])
          .order("hora_inicio", { ascending: true})

        if (reservas) {
          setHorariosOcupados(reservas);
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

  const validarHorarios = (): boolean => {
    if (!diaSeleccionado) {
      toast.error("Debes seleccionar un día");
      return false;
    }
    if (!horaInicio || !horaFin) {
      toast.error("Debes seleccionar hora de inicio y fin");
      return false;
    }
    if (horaInicio >= horaFin) {
      toast.error("La hora de fin debe ser mayor a la hora de inicio");
      return false;
    }
    return true;
  };

  const handleReservar = async () => {
    if (!user) {
      toast.info("Debes iniciar sesión para reservar.");
      return;
    }

    if (!validarHorarios()) return;

    // Bloqueo por penalización
    const penalizado = await PenalizacionService.usuarioEstaPenalizado(user.id);
    if (penalizado) {
      toast.error("No puedes realizar reservas mientras estés penalizado!");
      return;
    }

    if (!espacio) return;

    try {
      // Buscar el horario disponible que corresponde al día seleccionado
      const horariosData = await HoraDisponibleService.ObtenerHoraDisponibles();
      const horarioDelDia = horariosData?.find(
        h => h.espacio_id === espacio.id_espacio && h.dia_semana === diaSeleccionado
      );

      if (!horarioDelDia) {
        toast.error("No se encontró el horario para el día seleccionado");
        return;
      }

      const reservaPayload = {
        usuario_id: user.id,
        espacio_id: espacio.id_espacio,
        horario_id: horarioDelDia.id_horario,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        estado: "pendiente",
        fecha_reserva: new Date().toISOString(),
      };

      const nuevaReserva = await ReservaService.crearReserva(reservaPayload);
     
      //verificar el tipo de error
      if (!nuevaReserva) {
        //verificar si el horario está ocupado
        const { data: horarioActual }  = await supabase
          .from("HorarioDisponible")
          .select("ocupado")
          .eq("id_horario", horarioDelDia.id_horario)
          .single();
        
        if (horarioActual?.ocupado) {
          throw new Error("El horario está ocupado");
        } 
        throw new Error("No se pudo crear la reserva");
      }

      const API_URL = import.meta.env.VITE_API_URL;
      // Notificación push
      try {
          await fetch(`${API_URL}/new-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              message: `Tienes una reserva pendiente para ${espacio.nombre_lugar} el ${diaSeleccionado} de ${horaInicio} a ${horaFin}. ¡Confírmala!`,
              userId: user.id,
              role: 'cliente',
              title: 'Nueva Reserva' 
        })
      });

        await fetch(`${API_URL}/new-reservation-admin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `El usuario ${user.id} reservó el espacio ${espacio.nombre_lugar}.`,
            title: 'Nueva Reserva Realizada'
        })
      });
      } catch (error) {
        console.warn("No se pudo enviar la notificación push: ", error);
      }

      // Guardar notificación en Supabase
      try {
        await NotificacionServices.crearNotificacion({
        id_notificacion: crypto.randomUUID(),
        usuario_id: user.id,
        reserva_id: String(nuevaReserva.id_reserva),
        mensaje: `Tienes una reserva pendiente para ${espacio.nombre_lugar} el ${diaSeleccionado} de ${horaInicio} a ${horaFin}. ¡Confírmala!`,
        fecha_envio: new Date().toISOString(),
      });
    } catch (notifiError) {
      console.warn("No se pudo guardar la notificación: ", notifiError);
    }

      toast.success("Reserva creada correctamente!");
      navigate("/home");
    } catch (error: any) {
      console.error("Error al crear reserva:", error);

      // Mensaje específico según el tipo de error
      if (error?.message === "HORARIO_OCUPADO") {
        toast.error("⚠️ El horario seleccionado ya está ocupado. Por favor, elige otro horario.");
      } else if (error?.message?.includes("ocupado") || error?.message?.includes("conflict")) {
        toast.error("⚠️ El horario seleccionado ya está ocupado. Por favor, elige otro horario.");
      } else {
        toast.error("Hubo un error al crear la reserva. Por favor, intenta nuevamente.");
      }
    }
  };

  if (loading) return <p>Cargando espacio...</p>;
  if (!espacio) return <p>No se encontró el espacio.</p>;

  return (
    <div className="reservar-container">
      <h1>Reservar Espacio</h1>

      <div className="espacio-details">
        <img src={espacio.foto_url} alt={espacio.nombre_lugar} />
        <p><strong>Nombre:</strong> {espacio.nombre_lugar}</p>
        <p><strong>Descripción:</strong> {espacio.descripcion}</p>
        <p><strong>Capacidad:</strong> {espacio.capacidad}</p>
      </div>

      <h2>Selecciona tu Horario</h2>
      {diasDisponibles.length > 0 ? (
        <div className="formulario-reserva">
          <div className="form-group">
            <label htmlFor="dia">Día de la semana:</label>
            <select 
              id="dia"
              className="form-control"
              value={diaSeleccionado}
              onChange={(e) => setDiaSeleccionado(e.target.value)}
            >
              <option value="">Seleccione un día...</option>
              {diasDisponibles.map((dia) => (
                <option key={dia} value={dia}>
                  {dia.charAt(0).toUpperCase() + dia.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="horaInicio">Hora de inicio:</label>
            <input
              id="horaInicio"
              type="time"
              className="form-control"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="horaFin">Hora de fin:</label>
            <input
              id="horaFin"
              type="time"
              className="form-control"
              value={horaFin}
              onChange={(e) => setHoraFin(e.target.value)}
            />
          </div>

          <button
            className="btn-reservar"
            onClick={handleReservar}
          >
            Confirmar Reserva
          </button>
        </div>
      ) : (
        <p>No hay días disponibles para este espacio.</p>
      )}

      {mensajeError && <p className="error-message">{mensajeError}</p>}

      {horariosOcupados.map((reserva, index) => {
        const diaSemana = reserva.HorarioDisponible?.dia_semana || "N/A";
        return (
          <li key={index}>
            <span className="dia-badge">
              {diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)}
            </span>
            <span className="horario-info">
              <strong> {reserva.hora_inicio} </strong> a <strong> {reserva.hora_fin} </strong>
            </span>
            {reserva.estado && <span className="badge-estado">{reserva.estado}</span>}
          </li>
        );
      })}
      
    </div>
  );
};

export default Reservar;