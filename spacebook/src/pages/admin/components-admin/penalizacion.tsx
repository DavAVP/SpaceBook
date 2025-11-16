import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { PenalizacionService } from "../../../services/penalizacion.service";
import { ReservaService } from "../../../services/reserva.service";
import { EspacioService } from "../../../services/espacio.service";
import type { IPenalizacion } from "../../../interfaces/Penalizacion";
import type { IReserva } from "../../../interfaces/Reserva";
import type { IEspacio } from "../../../interfaces/Espacio";
import { NotificacionServices } from "../../../services/notificacion.service";

const Penalizacion: React.FC = () => {
  const [reservas, setReservas] = useState<IReserva[]>([]);
  const [espacios, setEspacios] = useState<IEspacio[]>([]);
  const [penalizaciones, setPenalizaciones] = useState<IPenalizacion[]>([]);
  const [loading, setLoading] = useState(true);

  // Tiempo máximo para confirmar (10s para pruebas)
  const TIEMPO_LIMITE = 10000;

  // Cargar reservas y espacios
  const fetchReservas = async () => {
    try {
      const data = await ReservaService.ObtenerReserva();
      const espacio = await EspacioService.ObtenerEspacios();
      const penalizaciones = await PenalizacionService.ObtenerPenalizaciones();

      console.log("Reservas obtenidas:", data);
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

      for (const reserva of reservasPendientes) {
        const fechaReserva = new Date(reserva.fecha_reserva);
        const diferencia = ahora.getTime() - fechaReserva.getTime();

        if (diferencia > TIEMPO_LIMITE) {
          console.log(`Reserva ${reserva.id_reserva} ha superado el límite`);
          // Notificar al admin
          await fetch("http://localhost:8080/new-penalization-admin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: `El usuario ${reserva.usuario_id} ha superado el tiempo límite de confirmación.`,
            }),
          });
        }
      }
    }, 5000);

    return () => clearInterval(intervalo);
  }, []);

  const fetchPenalizaciones = async () => {
    try {
      const data = await PenalizacionService.ObtenerPenalizaciones();
      console.log("Penalizaciones obtenidas:", data);
    } catch (error) {
      console.error("Error cargando penalizaciones:", error);
    }
  };

  useEffect(() => {
    fetchPenalizaciones();
  }, []);

  const handlePenalizar = async (reserva: IReserva, espacio: IEspacio) => {
    try {
    // Verificar si ya está penalizado
    const yaPenalizado = await PenalizacionService.usuarioEstaPenalizado(reserva.usuario_id);
    if (yaPenalizado) {
      toast.warning(`⚠️ El usuario ya tiene una penalización activa.`);
      return;
    }
    
      const message = `Usted ha sido penalizado para ${espacio.nombre_lugar} ya que se venció el tiempo de confirmación.`;

      await fetch("http://localhost:8080/new-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      await NotificacionServices.crearNotificacion({
        id_notificacion: crypto.randomUUID(),
        usuario_id: reserva.usuario_id,
        reserva_id: String(reserva.id_reserva,),
        mensaje: message,
        fecha_envio: new Date().toISOString(),
      });

      toast.info(`🔔 Notificación enviada al usuario ${reserva.usuario_id}`);
      // Crear penalización manual por 5 minutos en Supabase
      const ahora = new Date();
      const fin = new Date(ahora.getTime() + 5 * 60 * 1000); // +5 minutos

      const creada = await PenalizacionService.crearPenalizacion({
        usuario_id: reserva.usuario_id,
        motivo: "Penalización manual aplicada por el administrador",
        fecha_inicio: ahora.toISOString(),
        fecha_final: fin.toISOString(),
        estado_penalizacion: true,
      });

      if (!creada) {
        // Fallback backend (service key) si falla desde cliente
        try {
          const resp = await fetch("http://localhost:8080/admin/penalizar", {
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
          console.log("Fallo fallback backend penalizar", e);
          toast.error("No se pudo crear la penalización.");
        }
      } else {
        toast.success("Penalización creada (directa)");
      }

      // Refrescar listado de penalizaciones si se desea mostrar en UI
      try {
        const nuevas = await PenalizacionService.ObtenerPenalizaciones();
        if (Array.isArray(nuevas)) setPenalizaciones(nuevas);
      } catch (e) {
        console.log("No se pudo refrescar penalizaciones", e);
      }
      setReservas((prev) =>
        prev.map((r) =>
          r.id_reserva === reserva.id_reserva
            ? { ...r, estado: "notificado" }
            : r
        )
      );
    } catch (error) {
      console.error("Error enviando notificación:", error);
      alert("No se pudo enviar la notificación al usuario.");
    }
  };

  if (loading) return <p>Cargando reservas...</p>;

  // Mostrar solo reservas pendientes o expiradas
  const reservasPendientes = reservas.filter((r) => {
    console.log("Estado de reserva:", r.estado);
    return (
      r.estado === "pendiente" ||
      r.estado === "expirada" ||
      r.estado === "vencida"
    );
  });

  return (
    <div style={{ padding: "20px" }}>
      <h1>Panel de Penalizaciones</h1>
      {penalizaciones && <p className="penalizaciones">Lista de usuarios con reservas vencidas o pendientes.</p>}

      {reservasPendientes.length === 0 ? (
        <p>No hay usuarios para penalizar.</p>
      ) : (
        <table
          border={1}
          cellPadding={5}
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
          }}
        >
          <thead>
            <tr>
              <th>ID Reserva</th>
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

              return (
                <tr key={reserva.id_reserva}>
                  <td>{reserva.id_reserva}</td>
                  <td>{reserva.usuario_id}</td>

                  <td>{espacio ? espacio.nombre_lugar : "Cargando..."}</td>

                  <td>{new Date(reserva.fecha_reserva).toLocaleString()}</td>
                  <td>{reserva.estado}</td>
                  <td>
                    <button
                      style={{
                        background: "red",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        padding: "6px 12px",
                        cursor: "pointer",
                      }}
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
      )}
    </div>
  );
};

export default Penalizacion;
