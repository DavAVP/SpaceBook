import React, { useEffect, useState } from "react";
import { useUser } from "../../../context/usuario.context";
import { ReservaService } from "../../../services/reserva.service";
import { HoraDisponibleService } from "../../../services/horaDisponible.service";
import { EspacioService } from "../../../services/espacio.service";
import { toast } from "react-toastify";
import "../../../styles/misReservas.css";

const MisReservas: React.FC = () => {
  const { user } = useUser();
  const [reservas, setReservas] = useState<any[]>([]);
  const [nombreEspacioPorId, setNombreEspacioPorId] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchReservas = async () => {
      if (!user) return;
      const data = await ReservaService.ObtenerReserva();
      const misReservas = data?.filter(r => r.usuario_id === user.id) || [];
      setReservas(misReservas);
    };
    fetchReservas();
  }, [user]);

  useEffect(() => {
    const fetchNombresEspacios = async () => {
      const ids = Array.from(new Set(reservas.map(r => String(r.espacio_id || "")).filter(Boolean)));
      const idsNoCargados = ids.filter(id => !nombreEspacioPorId[id]);
      if (idsNoCargados.length === 0) return;

      const espacios = await EspacioService.ObtenerEspaciosPorIds(idsNoCargados);

      setNombreEspacioPorId(prev => {
        const next = { ...prev };
        const encontrados = new Set<string>();

        for (const espacio of espacios || []) {
          if (espacio?.id_espacio) {
            encontrados.add(espacio.id_espacio);
            next[espacio.id_espacio] = espacio.nombre_lugar;
          }
        }

        // Para IDs que no devolvió Supabase, evitar mostrar UUID.
        for (const id of idsNoCargados) {
          if (!encontrados.has(id) && !next[id]) next[id] = "Espacio no disponible";
        }

        return next;
      });
    };

    if (reservas.length > 0) fetchNombresEspacios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservas]);

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
    <div className="mis-reservas-page">
      <div className="mis-reservas-header">
        <h2>Mis Reservas</h2>
        <p className="mis-reservas-subtitle">Gestiona tus reservas pendientes y revisa el historial.</p>
      </div>

      {reservas.length === 0 && <p className="mis-reservas-empty">No tienes reservas.</p>}

      <ul className="mis-reservas-list">
        {reservas.map((reserva) => {
          const estado = String(reserva.estado || "").toLowerCase();
          const fecha = reserva.fecha_reserva ? new Date(reserva.fecha_reserva).toLocaleString() : null;
          const rangoHoras = reserva.hora_inicio && reserva.hora_fin ? `${reserva.hora_inicio}–${reserva.hora_fin}` : null;
          const espacioId = String(reserva.espacio_id || "");
          const nombreEspacio = espacioId ? nombreEspacioPorId[espacioId] : undefined;

          return (
            <li key={reserva.id_reserva} className="reserva-card">
              <div className="reserva-top">
                <div>
                  <h3 className="reserva-title">Reserva #{String(reserva.id_reserva).slice(0, 8)}</h3>
                  <p className="reserva-meta">
                    <strong>Espacio:</strong> {nombreEspacio || (espacioId ? "Cargando..." : "Espacio no disponible")}
                    {rangoHoras ? <><br /><strong>Hora:</strong> {rangoHoras}</> : null}
                    {fecha ? <><br /><strong>Creada:</strong> {fecha}</> : null}
                  </p>
                </div>
                <span className={`status-chip ${estado || ""}`}>{estado || "sin estado"}</span>
              </div>

              <div className="reserva-actions">
                {estado === "pendiente" && (
                  <button
                    className="reserva-btn confirm"
                    onClick={() => confirmarReserva(reserva.id_reserva)}
                  >
                    Confirmar
                  </button>
                )}

                {estado !== "rechazada" && (
                  <button
                    className="reserva-btn reject"
                    onClick={() => rechazarReserva(reserva.id_reserva, reserva.horario_id)}
                  >
                    Rechazar
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default MisReservas;
