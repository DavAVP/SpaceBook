import { supabase } from "../api/supabase.config";
import { toast } from "react-toastify";

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
            console.log("Usuario logeado:", data.user)
            return data.user;
        }catch(e){
            console.log("Error ", e);
            return null;
        }
    },

    HandleSingUp: async(email: string, password: string) =>{
        try{
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: 'http://localhost:5173/home'
                }
            })
            if(error){
                throw new Error(error.message)
            }
            console.log("Se le envio al correo de verificacion a:", email)
            return data.user;
        }catch(e){
            console.log("Error al registrar usuario", e)
            return null;
        }
    },

    HandleLogout: async() =>{
        const { error } = await supabase.auth.signOut()
        if(error){
            console.log("Error al cerrar session", error.message)
            toast.error("Error al cerrar sesión: " + error.message)
            return;
        }
        toast.info("Gracias por visitarnos, vuelve pronto!")
        return;
    }
}