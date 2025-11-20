
import { supabase } from "../api/supabase.config";
import type { IEspacio } from "../interfaces/Espacio";
import type { IHorarioDisponible } from "../interfaces/Horario_disponible";

export const EspacioService = {
    //Crear espacio
    async crearEspacio(Espacio: IEspacio){
        const {data, error} = await supabase.from('Espacio').insert(Espacio).select().single();
        if(error){
            console.log('Error al crear el espacio', error.message)
            return null
        }
        return data as IEspacio
    },

    async cambiarDisponibilidad(id_espacio: string, disponible: boolean) {
        const { error } = await supabase
            .from('Espacio')
            .update({ espacio_disponible: disponible })
            .eq('id_espacio', id_espacio);

        if (error) {
            console.log('Error al actualizar disponibilidad', error); 
            return false;
        }
        return true;
    },

    //Obtener todos los espacios
    async ObtenerEspacios(){
        const {data, error} = await supabase.from('Espacio').select('*')
        if(error){
            console.log('Error al obtener los espacios', error.message)
            return null
        }
        return data as IEspacio[]
    },

    //Obtener un espacio
    async ObtenerEspacioID(id_espacio: string){
        const {data, error} = await supabase.from('Espacio').select().eq('id_espacio', id_espacio).single()
        if(error){
            console.log('Error al obtener el espacio', error.message)
            return null
        }
        return data as IEspacio
    },

    //Actualizar espacioo
    async ActualizarEspacio(id_espacio: string, espacio: Partial<IEspacio>, id_horario: string, horario: Partial<IHorarioDisponible>){
        await supabase.from('HorarioDisponible').update(horario).eq('id_horario', id_horario).select().single()
        const {data, error} = await supabase.from('Espacio').update(espacio).eq('id_espacio', id_espacio).select().single()
        if(error){
            console.log('Error al actualizar el espacio', error.message)
            return null
        }
        return data as IEspacio        
    },

    //Eliminar espacio
    async EliminarEspacio(id_espacio: string, espacio_id: string){
        await supabase.from('HorarioDisponible').delete().eq('espacio_id', espacio_id);
        const {error} = await supabase.from('Espacio').delete().eq('id_espacio', id_espacio);
        if(error){
            console.log('Error al eliminar el espacio', error.message)
            return false
        }
        return true
    }
}



