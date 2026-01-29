
import { supabase } from "../api/supabase.config";
import type { IEspacio } from "../interfaces/Espacio";
import type { IHorarioDisponible } from "../interfaces/Horario_disponible";

export const EspacioService = {
    //Crear espacio
    async crearEspacio(Espacio: IEspacio){
        const {data, error} = await supabase.from('Espacio').insert(Espacio).select().single();
        if(error){
            console.error('Error al crear el espacio', error)
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
            console.error('Error al actualizar disponibilidad', error); 
            return false;
        }
        return true;
    },

    //Obtener todos los espacios
    async ObtenerEspacios(){
        const {data, error} = await supabase.from('Espacio').select('*')
        if(error){
            console.error('Error al obtener los espacios', error)
            return null
        }
        return data as IEspacio[]
    },

    //Obtener un espacio
    async ObtenerEspacioID(id_espacio: string){
        const {data, error} = await supabase.from('Espacio').select().eq('id_espacio', id_espacio).single()
        if(error){
            console.error('Error al obtener el espacio', error)
            return null
        }
        return data as IEspacio
    },

    // Obtener varios espacios por IDs (para mapear id -> nombre)
    async ObtenerEspaciosPorIds(ids: string[]) {
        const uniqueIds = Array.from(new Set(ids)).filter(Boolean);
        if (uniqueIds.length === 0) return [] as Pick<IEspacio, 'id_espacio' | 'nombre_lugar'>[];

        const { data, error } = await supabase
            .from('Espacio')
            .select('id_espacio, nombre_lugar')
            .in('id_espacio', uniqueIds);

        if (error) {
            console.error('Error al obtener espacios por ids', error);
            return [] as Pick<IEspacio, 'id_espacio' | 'nombre_lugar'>[];
        }

        return (data || []) as Pick<IEspacio, 'id_espacio' | 'nombre_lugar'>[];
    },

    //Actualizar espacioo
    async ActualizarEspacio(id_espacio: string, espacio: Partial<IEspacio>, id_horario: string, horario: Partial<IHorarioDisponible>){
        await supabase.from('HorarioDisponible').update(horario).eq('id_horario', id_horario).select().single()
        const {data, error} = await supabase.from('Espacio').update(espacio).eq('id_espacio', id_espacio).select().single()
        if(error){
            console.error('Error al actualizar el espacio', error)
            return null
        }
        return data as IEspacio        
    },

    //Eliminar espacio
    async EliminarEspacio(id_espacio: string, espacio_id: string){
        await supabase.from('HorarioDisponible').delete().eq('espacio_id', espacio_id);
        const {error} = await supabase.from('Espacio').delete().eq('id_espacio', id_espacio);
        if(error){
            console.error('Error al eliminar el espacio', error)
            return false
        }
        return true
    }
}



