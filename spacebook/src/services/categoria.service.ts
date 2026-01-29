import { supabase } from "../api/supabase.config";
import type { ICategoria } from "../interfaces/Categoria";

const TABLE_NAME = "Categoria";

export interface NuevaCategoriaInput {
    nombre: string;
    descripcion?: string;
}

export const CategoriaService = {
    async obtenerCategorias(): Promise<ICategoria[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("nombre", { ascending: true });

        if (error) {
            console.error("Error al obtener las categorías", error);
            return [];
        }

        return (data || []) as ICategoria[];
    },

    async crearCategoria(input: NuevaCategoriaInput): Promise<ICategoria | null> {
        const nuevaCategoria: ICategoria = {
            id_categoria: crypto.randomUUID(),
            nombre: input.nombre.trim(),
            descripcion: input.descripcion?.trim() || null,
        };

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(nuevaCategoria)
            .select()
            .single();

        if (error) {
            console.error("Error al crear la categoría", error);
            return null;
        }

        return data as ICategoria;
    },

    async actualizarCategoria(
        id_categoria: string,
        input: NuevaCategoriaInput
    ): Promise<ICategoria | null> {
        const updates = {
            nombre: input.nombre.trim(),
            descripcion: input.descripcion?.trim() || null,
        };

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(updates)
            .eq("id_categoria", id_categoria)
            .select()
            .single();

        if (error) {
            console.error("Error al actualizar la categoría", error);
            return null;
        }

        return data as ICategoria;
    },

    async eliminarCategoria(id_categoria: string): Promise<boolean> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id_categoria", id_categoria);

        if (error) {
            console.error("Error al eliminar la categoría", error);
            return false;
        }

        return true;
    },
};