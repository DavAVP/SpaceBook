import { supabase } from "../api/supabase.config";
import { toast } from "react-toastify";
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

export const AuthService = {
    supabase,
    HandleLogin: async(email: string, password: string) =>{
        try{
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,               
            })
            if(error){
                throw new Error(error.message)
            }
            if(!data.user){
                throw new Error("Credenciales invalidas")
            }
            return data.user;
        }catch(e){
            console.error("Error iniciando sesión", e);
            return null;
        }
    },

    HandleSingUp: async(email: string, password: string) =>{
        try{
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${FRONTEND_URL}/home`
                }
            })
            if(error){
                throw new Error(error.message)
            }
            return data.user;
        }catch(e){
            console.error("Error al registrar usuario", e)
            return null;
        }
    },

    HandleLogout: async() =>{
        const { error } = await supabase.auth.signOut()
        if(error){
            console.error("Error al cerrar sesión", error)
            toast.error("Error al cerrar sesión: " + error.message)
            return;
        }
        toast.info("Gracias por visitarnos, vuelve pronto!")
        return;
    }
}