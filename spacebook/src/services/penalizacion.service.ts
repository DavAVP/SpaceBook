import { supabase } from "../api/supabase.config";
import type { IPenalizacion } from "../interfaces/Penalizacion";


export const PenalizacionService = {
    //Crear penalizacion
    async crearPenalizacion(penalizacion: IPenalizacion){
        const {data, error} = await supabase.from('Penalizacion').insert(penalizacion).select().single();
        if(error){
            console.log('Error al crear la penalizacion', error.message)
            return null
        }
        return data as IPenalizacion
    },

    //Obtener todos los espacios
    async ObtenerPenalizaciones(){
        const {data, error} = await supabase.from('Penalizacion').select('*')
        if(error){
            console.log('Error al obtener las penalizaciones', error.message)
            return null
        }
        return data as IPenalizacion[]
    },

    //Obtener una penalizacion
    async ObtenerPenalizacionID(id_penalizacion: string){
        const {data, error} = await supabase.from('Penalizacion').select().eq('id_penalizacion', id_penalizacion).single()
        if(error){
            console.log('Error al obtener la penalizacion', error.message)
            return null
        }
        return data as IPenalizacion
    },

    //Actualizar penalizacion
    async ActualizarPenalizacion(id_penalizacion: string, penalizacion: Partial<IPenalizacion>){
        const {data, error} = await supabase.from('Penalizacion').update(penalizacion).eq('id_penalizacion', id_penalizacion).select().single()
        if(error){
            console.log('Error al actualizar la penalizacion', error.message)
            return null
        }
        return data as IPenalizacion        
    },

    //Eliminar penalizacion
    async EliminarPenalizacion(id_penalizacion: string){
        const {error} = await supabase.from('Penalizacion').delete().eq('id_penalizacion', id_penalizacion)
        if(error){
            console.log('Error al eliminar la penalizacion', error.message)
            return false
        }
        return true
    }
}



