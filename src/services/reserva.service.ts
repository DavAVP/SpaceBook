import { supabase } from "../api/supabase.config";
import type { IReserva } from "../interfaces/Reserva";


export const ReservaService = {
    //Crear una nueva reserva
    async crearReserva(reservaPayload: Omit<IReserva, "id_reserva">){
        const { data: espacio, error: espacioErr } = await supabase
            .from('Espacio')
            .select('espacio_disponible')
            .eq('id_espacio', reservaPayload.espacio_id)
            .single();

        if (espacioErr) {
            console.log('Error al verificar el espacio', espacioErr);
            return null;
        }

        if (!espacio || espacio.espacio_disponible !== true) {
            console.log('Espacio no disponible para reservar');
            return null;
        }

    // Insertar la reserva
        const { data: nuevaReserva, error: insertErr } = await supabase
            .from('Reserva')
            .insert(reservaPayload)
            .select()
            .single();

        if (insertErr) {
            console.log('Error al crear la reserva', insertErr);
            return null;
        }

        const reserva = nuevaReserva as IReserva;

        // Marcar el espacio como no disponible
        const { error: updateErr } = await supabase
            .from('Espacio')
            .update({ espacio_disponible: false })
            .eq('id_espacio', reserva.espacio_id);

        if (updateErr) {
            console.log('Error al actualizar Espacio tras crear reserva', updateErr);
            // eliminar la reserva creada
            const { error: delErr } = await supabase
                .from('Reserva')
                .delete()
                .eq('id_reserva', reserva.id_reserva);

            if (delErr) {
                console.error('Rollback fallido: no se pudo eliminar la reserva', delErr);
            } else {
                console.info('Rollback: reserva eliminada por fallo al actualizar Espacio');
            }

            return null;
        }
        return reserva;
    },

    //Obtener todas las reservas
    async ObtenerReserva(){
        const {data, error} = await supabase.from('Reserva').select('*')
        if(error){
            console.log('Error al obtener las reservas', error.message)
            return null
        }
        return data as IReserva[]
    },

    //Obtener una reserva 
    async ObtenerReservaID(id_reserva: string){
        const {data, error} = await supabase.from('Reserva').select().eq('id_reserva', id_reserva).single()
        if(error){
            console.log('Error al obtener la reserva', error.message)
            return null
        }
        return data as IReserva
    },

    //Actualizar reserva por el id de esa reserva
    async ActualizarReserva(id_reserva: string, reserva: Partial<IReserva>){
        const {data, error} = await supabase.from('Reserva').update(reserva).eq('id_reserva', id_reserva).select().single()
        if(error){
            console.log('Error al actualizar la reserva', error.message)
            return null
        }
        return data as IReserva        
    },

    //Eliminar reserva por id
    async EliminarReserva(id_reserva: string): Promise<boolean>{
        const {error} = await supabase.from('Reserva').delete().eq('id_reserva', id_reserva)
        if(error){
            console.log('Error al eliminar la reserva', error.message)
            return false
        }
        return true
    }
}



