import React, { useEffect, useState } from "react";
import "../../../styles/penalizaciones.css";
import { toast } from "react-toastify";
import { PenalizacionService } from "../../../services/penalizacion.service";
import { ReservaService } from "../../../services/reserva.service";
import { EspacioService } from "../../../services/espacio.service";
import { HoraDisponibleService } from "../../../services/horaDisponible.service";
import type { IPenalizacion } from "../../../interfaces/Penalizacion";
import type { IReserva } from "../../../interfaces/Reserva";
import type { IEspacio } from "../../../interfaces/Espacio";
import { NotificacionServices } from "../../../services/notificacion.service";
import "../../../styles/admin.css";

const Penalizacion: React.FC = () => {
  const [reservas, setReservas] = useState<IReserva[]>([]);
  const [espacios, setEspacios] = useState<IEspacio[]>([]);
  const [penalizaciones, setPenalizaciones] = useState<IPenalizacion[]>([]);
  const [loading, setLoading] = useState(true);

  // Tiempo máximo para confirmar (10s para pruebas)
  const TIEMPO_LIMITE = 10000;

  const haVencidoTiempoConfirmacion = (reserva: IReserva, ahora: Date) => {
    if (!reserva.fecha_reserva) return false;
    const fechaReserva = new Date(reserva.fecha_reserva);
    if (Number.isNaN(fechaReserva.getTime())) return false;
    return ahora.getTime() - fechaReserva.getTime() > TIEMPO_LIMITE;
  };

  const puedePenalizarReserva = (reserva: IReserva, ahora: Date) => {
    const estado = String(reserva.estado || "").toLowerCase();
    if (estado === "vencida" || estado === "expirada") return true;
    if (estado === "pendiente") return haVencidoTiempoConfirmacion(reserva, ahora);
    return false;
  };

  const fetchReservas = async () => {
    try {
      const data = await ReservaService.ObtenerReserva();
      const espacio = await EspacioService.ObtenerEspacios();
      const penalizaciones = await PenalizacionService.ObtenerPenalizaciones();
      if (Array.isArray(data)) {
        setReservas(data);
      }
      if (Array.isArray(espacio)) {
        setEspacios(espacio);
      }
      if (Array.isArray(penalizaciones)) {
        setPenalizaciones(penalizaciones);
      }

    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservas();

    const intervalo = setInterval(async () => {
      const data = await ReservaService.ObtenerReserva();
      if (!Array.isArray(data)) return;

      const ahora = new Date();
      const reservasPendientes = data.filter((r) => r.estado === "pendiente");
      const API_URL = import.meta.env.VITE_API_URL;

      for (const reserva of reservasPendientes) {
        if (haVencidoTiempoConfirmacion(reserva, ahora)) {
          console.warn(`Reserva ${reserva.id_reserva} ha superado el límite`);

          // Marcar como vencida y liberar el horario (solo una vez)
          if (reserva.id_reserva) {
            await ReservaService.ActualizarReserva(reserva.id_reserva, { estado: "vencida" });
          }
          if (reserva.horario_id) {
            await HoraDisponibleService.ActualizarHorario(reserva.horario_id, { ocupado: false });
          }

          // Notificar al admin
          await fetch(`${API_URL}/new-penalization-admin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: `El usuario ${reserva.usuario_id} ha superado el tiempo límite de confirmación.`,
              serId: reserva.usuario_id,
              role: "cliente",
              title: "Reserva Vencida",
            }),
          });

          await fetch(`${API_URL}/new-penalization-admin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: `El usuario ${reserva.usuario_id} no confirmó la reserva a tiempo.`,
            }),
          });

          setReservas((prev) =>
            prev.map((r) =>
              r.id_reserva === reserva.id_reserva ? { ...r, estado: "vencida" } : r
            )
          );
        }
      }
    }, 5000);

    return () => clearInterval(intervalo);
  }, []);

  const fetchPenalizaciones = async () => {
    try {
      const data = await PenalizacionService.ObtenerPenalizaciones();
      if (Array.isArray(data)) {
        setPenalizaciones(data);
      }
    } catch (error) {
      console.error("Error cargando penalizaciones:", error);
    }
  };

  useEffect(() => {
    fetchPenalizaciones();
  }, []);

  const handlePenalizar = async (reserva: IReserva, espacio: IEspacio) => {
    const API_URL = import.meta.env.VITE_API_URL;
    try {
    const ahoraEval = new Date();
    if (!puedePenalizarReserva(reserva, ahoraEval)) {
      toast.error("Aún no puedes penalizar: no se ha vencido el tiempo de la reserva.");
      return;
    }

    // Verificar si ya está penalizado
    const yaPenalizado = await PenalizacionService.usuarioEstaPenalizado(reserva.usuario_id);
    if (yaPenalizado) {
      toast.warning(`El usuario ya tiene una penalización activa.`);
      return;
    }
    
      const message = `Usted ha sido penalizado para ${espacio.nombre_lugar} ya que se venció el tiempo de confirmación.`;

      await fetch(`${API_URL}/new-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message,
          userId: reserva.usuario_id,
          role: 'cliente',
          title: 'Penalización'
        }),
      });

      await NotificacionServices.crearNotificacion({
        id_notificacion: crypto.randomUUID(),
        usuario_id: reserva.usuario_id,
        reserva_id: String(reserva.id_reserva,),
        mensaje: message,
        fecha_envio: new Date().toISOString(),
      });

      toast.info(`Notificación enviada al usuario ${reserva.usuario_id}`);
      // Crear penalización manual por 5 minutos en Supabase
      const ahoraPenalizacion = new Date();
      const fin = new Date(ahoraPenalizacion.getTime() + 5 * 60 * 1000);

      const creada = await PenalizacionService.crearPenalizacion({
        usuario_id: reserva.usuario_id,
        motivo: "Penalización manual aplicada por el administrador",
        fecha_inicio: ahoraPenalizacion.toISOString(),
        fecha_final: fin.toISOString(),
        estado_penalizacion: true,
      });

      if (!creada) {
        // Fallback backend (service key) si falla desde cliente
        try {
          const resp = await fetch(`${API_URL}/admin/penalizar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuario_id: reserva.usuario_id, minutos: 5 }),
          });
          if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            toast.error(`Error creando penalización: ${err.error || resp.status}`);
          } else {
            const json = await resp.json();
            toast.success("Penalización creada (backend)");
            if (json.penalizacion) {
              setPenalizaciones((prev) => [...prev, json.penalizacion]);
            }
          }
        } catch (e) {
          console.error("Fallo fallback backend penalizar", e);
          toast.error("No se pudo crear la penalización.");
        }
      } else {
        toast.success("Penalización creada (directa)");
      }

      // Persistir estado de reserva como penalizada para evitar re-penalizaciones
      if (reserva.id_reserva) {
        try {
          await ReservaService.ActualizarReserva(reserva.id_reserva, { estado: "penalizado" });
        } catch (e) {
          console.error("No se pudo actualizar estado a penalizado", e);
        }
      }

      // Refrescar listado de penalizaciones
      try {
        const nuevas = await PenalizacionService.ObtenerPenalizaciones();
        if (Array.isArray(nuevas)) setPenalizaciones(nuevas);
      } catch (e) {
        console.error("No se pudo refrescar penalizaciones", e);
      }
      setReservas((prev) =>
        prev.map((r) =>
          r.id_reserva === reserva.id_reserva ? { ...r, estado: "penalizado" } : r
        )
      );
    } catch (error) {
      console.error("Error enviando notificación:", error);
      alert("No se pudo enviar la notificación al usuario.");
    }
  };

  if (loading) return <p>Cargando reservas...</p>;

  const ahoraRender = new Date();

  // Mostrar solo reservas que realmente son penalizables:
  // - pendientes pero ya vencidas por tiempo
  // - o ya marcadas como vencida/expirada
  const reservasPendientes = reservas.filter((r) => {
    const estado = String(r.estado || "").toLowerCase();
    if (estado === "penalizado") return false;
    if (estado === "vencida" || estado === "expirada") return true;
    if (estado === "pendiente") return haVencidoTiempoConfirmacion(r, ahoraRender);
    return false;
  });

  return (
    <div className="admin-page penalizaciones-page">
      <div className="admin-section">
        <div className="penalizaciones-header">
          <h1>Panel de Penalizaciones</h1>
          {penalizaciones && <p className="penalizaciones">Lista de usuarios con reservas vencidas o pendientes.</p>}
        </div>

        {reservasPendientes.length === 0 ? (
          <p>No hay usuarios para penalizar.</p>
        ) : (
          <div className="penalizaciones-table-wrap">
            <table className="penalizaciones-table">
              <thead>
                <tr>
                  <th>Fecha de la Reserva</th>
                  <th>Usuario</th>
                  <th>Espacio</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {reservasPendientes.map((reserva) => {
                  const espacio = espacios.find(
                    (e) => e.id_espacio === reserva.espacio_id
                  );
                  const estado = String(reserva.estado || "").toLowerCase();

                  const puedePenalizar = puedePenalizarReserva(reserva, ahoraRender);

                  const usuarioId = String(reserva.usuario_id || "");

                  const rangoHoras = reserva.hora_inicio && reserva.hora_fin ? `${reserva.hora_inicio}–${reserva.hora_fin}` : null;
                  const fechaDia = reserva.fecha_reserva
                    ? new Date(reserva.fecha_reserva).toLocaleDateString("es-ES", {
                        weekday: "short",
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })
                    : "Sin fecha";
                  const reservaLabel = `${fechaDia}${rangoHoras ? ` · ${rangoHoras}` : ""}`;

                  return (
                    <tr key={reserva.id_reserva}>
                      <td className="mono">{reservaLabel}</td>
                      <td className="mono">{usuarioId || "Usuario no disponible"}</td>
                      <td>{espacio ? espacio.nombre_lugar : "Cargando..."}</td>
                      <td>{new Date(reserva.fecha_reserva).toLocaleString()}</td>
                      <td><span className={`status-chip ${estado}`}>{estado || "sin estado"}</span></td>
                      <td>
                        <button
                          className="penalizar-btn"
                          disabled={!puedePenalizar || !espacio}
                          title={!puedePenalizar ? "Aún no vence el tiempo de confirmación" : "Penalizar"}
                          onClick={() =>
                            espacio && handlePenalizar(reserva, espacio)
                          }
                        >
                          Penalizar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Penalizacion;
