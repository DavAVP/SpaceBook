import React, { useEffect, useState } from "react";
import { useUser } from "../../../context/usuario.context";
import { ReservaService } from "../../../services/reserva.service";
import { HoraDisponibleService } from "../../../services/horaDisponible.service";
import { toast } from "react-toastify";

const MisReservas: React.FC = () => {
  const { user } = useUser();
  const [reservas, setReservas] = useState<any[]>([]);

  useEffect(() => {
    const fetchReservas = async () => {
      if (!user) return;
      const data = await ReservaService.ObtenerReserva();
      const misReservas = data?.filter(r => r.usuario_id === user.id) || [];
      setReservas(misReservas);
    };
    fetchReservas();
  }, [user]);

  const confirmarReserva = async (id_reserva: string) => {
    const actualizada = await ReservaService.ActualizarReserva(id_reserva, { estado: "confirmada" });
    if (actualizada) {
      setReservas(prev =>
        prev.map(r => (r.id_reserva === id_reserva ? { ...r, estado: "confirmada" } : r))
      );
      toast.success("Reserva confirmada con éxito!");
    }
  };

    const rechazarReserva = async (id_reserva: string, horarioId: string) => {
    const actualizada = await ReservaService.ActualizarReserva(id_reserva, { estado: "rechazada" });
    if (actualizada) {
      setReservas(prev =>
        prev.map(r => (r.id_reserva === id_reserva ? { ...r, estado: "rechazada" } : r))
      );
      await HoraDisponibleService.ActualizarHorario(horarioId, { ocupado: false });
      toast.info("Reserva rechazada, horario disponible nuevamente");
    }
  };

  return (
    <div>
      <h2>Mis Reservas</h2>
      {reservas.length === 0 && <p>No tienes reservas.</p>}
      <ul>
        {reservas.map(reserva => (
          <li key={reserva.id_reserva}>
            {reserva.espacio_id} — Estado: {reserva.estado}
            {reserva.estado === "pendiente" && (
              <button onClick={() => confirmarReserva(reserva.id_reserva)}>
                Confirmar
              </button>
            )}
              <button onClick={() => rechazarReserva(reserva.id_reserva, reserva.horario_id)}>
                  Rechazar
              </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MisReservas;
