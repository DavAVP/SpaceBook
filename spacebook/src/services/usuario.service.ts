
import { supabase } from "../api/supabase.config";

export const UsuarioService = {
    async ObtenerUsuario(){
        const {data, error} = await supabase.auth.getUser();

        if(error){
            console.log("Error al encontrar los usuario", error.message)
        }
        return data.user;
    },

    // se actualiza el usuario 
    async ActualizarUsuario(usuario: any){
        const {data, error} = await supabase.auth.updateUser(usuario)
        if(error){
            console.log("Error al actualizar al usuario", error.message)
            return null;
        }
        
        console.log("Usuario actulizado",data.user);
    },

    // Obtener perfiles (nombre) por ids para mostrar en UI
    async ObtenerPerfilesPorIds(ids: string[]) {
        const uniqueIds = Array.from(new Set(ids)).filter(Boolean);
        if (uniqueIds.length === 0) return [] as Array<{ id: string; nombre: string | null }>;

        const { data, error } = await supabase
            .from("profiles")
            .select("id, nombre")
            .in("id", uniqueIds);

        if (error) {
            console.log("Error al obtener perfiles por ids", error.message);
            return [] as Array<{ id: string; nombre: string | null }>;
        }

        return (data || []) as Array<{ id: string; nombre: string | null }>;
    },

    // Admin: resolver perfiles con email via backend (service role) para evitar RLS
    async ObtenerPerfilesAdminPorIds(ids: string[]) {
        const uniqueIds = Array.from(new Set(ids)).filter(Boolean);
        if (uniqueIds.length === 0) return [] as Array<{ id: string; nombre: string | null; email: string | null }>;

        const API_URL = import.meta.env.VITE_API_URL;
        if (!API_URL) return [] as Array<{ id: string; nombre: string | null; email: string | null }>;

        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        if (!token) return [] as Array<{ id: string; nombre: string | null; email: string | null }>;

        try {
            const resp = await fetch(`${API_URL}/admin/user-profiles`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ ids: uniqueIds }),
            });

            if (!resp.ok) return [] as Array<{ id: string; nombre: string | null; email: string | null }>;
            const json = await resp.json().catch(() => ({}));
            return (json?.data || []) as Array<{ id: string; nombre: string | null; email: string | null }>;
        } catch (e) {
            console.log("Error llamando /admin/user-profiles", e);
            return [] as Array<{ id: string; nombre: string | null; email: string | null }>;
        }
    },
}