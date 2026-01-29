import { supabase } from "../api/supabase.config";
import type { INotificaciones } from "../interfaces/Notificacion";

export const NotificacionServices = {
    //Crear notificacion
    async crearNotificacion(notificacion: INotificaciones){
        const {data, error} = await supabase.from('Notificacion').insert(notificacion).select().single();
        if(error){
            console.error('Error al crear la notificacion', error.message)
            return null
        }
        return data as INotificaciones
    },

    //Obtener todas las notificaciones
    async ObtenerNotificacion(){
        const {data, error} = await supabase.from('Notificacion').select('*')
        if(error){
            console.error('Error al obtener las notificaciones', error.message)
            return null
        }
        return data as INotificaciones[]
    },

    //Obtener una notificacion
    async ObtenerNotificacionID(id_notificacion:string){
        const {data, error} = await supabase.from('Notificacion').select().eq('id_notificacion', id_notificacion).single()
        if(error){
            console.error('Error al obtener la notificacion', error.message)
            return null
        }
        return data as INotificaciones
    },

    //Actualizar notificacion por el id de esa reserva
    async ActualizarNotificacion(id_notificacion: string, notificacion: Partial<INotificaciones>){
        const {data, error} = await supabase.from('Notificacion').update(notificacion).eq('id_notificacion', id_notificacion).select().single()
        if(error){
            console.error('Error al actualizar la notificacion', error.message)
            return null
        }
        return data as INotificaciones        
    },

    //Eliminar notificacion id
    async EliminarNotificacion(id_notificacion: string){
        const {error} = await supabase.from('Notificacion').delete().eq('id_notificacion', id_notificacion)
        if(error){
            console.error('Error al eliminar la notificacion', error.message)
            return false
        }
        return true
    }
}



