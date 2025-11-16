import { supabase } from "../api/supabase.config";
import type { IReserva } from "../interfaces/Reserva";

export const ReservaService = {
  async crearReserva(reservaPayload: Omit<IReserva, "id_reserva">) {
    ////
    // Bloqueo por penalización activa (no permitir reservar si tiene una vigente)
    try {
      const nowIso = new Date().toISOString();
      const { data: penalActivas, error: penErr } = await supabase
        .from("Penalizacion")
        .select("id_penalizacion, fecha_final, estado_penalizacion")
        .eq("usuario_id", reservaPayload.usuario_id)
        .eq("estado_penalizacion", true)
        .gt("fecha_final", nowIso);

      if (penErr) {
        console.log("Error al verificar penalización activa", penErr);
        return null;
      }

      if (Array.isArray(penalActivas) && penalActivas.length > 0) {
        console.log("Usuario con penalización activa. Reserva bloqueada.");
        return null;
      }
    } catch (e) {
      console.log("Excepción verificando penalización activa", e);
      return null;
    }

    // Verificar si el horario está disponible
    const { data: horario, error: horarioErr } = await supabase
      .from("HorarioDisponible")
      .select("ocupado")
      .eq("id_horario", reservaPayload.horario_id)
      .single();

    if (horarioErr) {
      console.log("Error al verificar el horario", horarioErr);
      return null;
    }

    if (!horario || horario.ocupado) {
      console.log("Horario ya está ocupado");
      return null;
    }


    //// 
    // Insertar la reserva
    const { data: nuevaReserva, error: insertErr } = await supabase
      .from("Reserva")
      .insert(reservaPayload)
      .select()
      .single();

    if (insertErr) {
      console.log("Error al crear la reserva", insertErr);
      console.log("Payload enviado:", reservaPayload);
      return null;
    }

    const reserva = nuevaReserva as IReserva;

    // Marcar el horario como ocupado
    const { error: updateHorarioErr } = await supabase
      .from("HorarioDisponible")
      .update({ ocupado: true })
      .eq("id_horario", reservaPayload.horario_id);

    if (updateHorarioErr) {
      console.log("Error al actualizar horario como ocupado", updateHorarioErr);
      // rollback reserva
      await supabase
        .from("Reserva")
        .delete()
        .eq("id_reserva", reserva.id_reserva);
      return null;
    }

    return reserva;
  },

  async ObtenerReserva() {
    const { data, error } = await supabase.from("Reserva").select("*");
    console.log("Error en ObtenerReserva:", error);
    console.log("Data cruda:", data);
    if (error) {
      console.log("Error al obtener las reservas", error.message);
      return null;
    }
    return data as IReserva[];
  },

  async ObtenerReservaID(id_reserva: string) {
    const { data, error } = await supabase
      .from("Reserva")
      .select()
      .eq("id_reserva", id_reserva)
      .single();
    if (error) {
      console.log("Error al obtener la reserva", error.message);
      return null;
    }
    return data as IReserva;
  },

  async ActualizarReserva(id_reserva: string, reserva: Partial<IReserva>) {
    const { data, error } = await supabase
      .from("Reserva")
      .update(reserva)
      .eq("id_reserva", id_reserva)
      .select()
      .single();
    if (error) {
      console.log("Error al actualizar la reserva", error.message);
      return null;
    }
    return data as IReserva;
  },

  async EliminarReserva(id_reserva: string): Promise<boolean> {
    const { error } = await supabase
      .from("Reserva")
      .delete()
      .eq("id_reserva", id_reserva);
    if (error) {
      console.log("Error al eliminar la reserva", error.message);
      return false;
    }
    return true;
  },
};
