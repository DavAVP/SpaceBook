import { supabase } from "../api/supabase.config";
import type { IHorarioDisponible } from "../interfaces/Horario_disponible";

export const HoraDisponibleService = {
    //Crear notificacion
    async crearHoraDisponible(horaDisponible: IHorarioDisponible){
        const {data, error} = await supabase.from('HorarioDisponible').insert(horaDisponible).select().single();
        if(error){
            console.log('Error al crear la notificacion', error.message)
            return null
        }
        return data as IHorarioDisponible
    },

    //Obtener todos los horarios
    async ObtenerHoraDisponibles(){
        const {data, error} = await supabase.from('HorarioDisponible').select('*')
        if(error){
            console.log('Error al obtener las notificaciones', error.message)
            return null
        }
        return data as IHorarioDisponible[]
    },

    //Obtener un horario
    async ObtenerHorarioID(id_horario: string){
        const {data, error} = await supabase.from('HorarioDisponible').select().eq('id_horario', id_horario).single()
        if(error){
            console.log('Error al obtener la notificacion', error.message)
            return null
        }
        return data as IHorarioDisponible
    },

    //Actualizar horario 
    async ActualizarHorario(id_horario: string, horarioDisponible: Partial<IHorarioDisponible>){
        const {data, error} = await supabase.from('HorarioDisponible').update(horarioDisponible).eq('id_horario', id_horario).select().single()
        if(error){
            console.log('Error al actualizar la notificacion', error.message)
            return null
        }
        return data as IHorarioDisponible        
    },

    //Eliminar horario
    async EliminarHorario(id_horario: string){
        const {error} = await supabase.from('HorarioDisponible').delete().eq('id_horario', id_horario)
        if(error){
            console.log('Error al eliminar la notificacion', error.message)
            return false
        }
        return true
    }
}



