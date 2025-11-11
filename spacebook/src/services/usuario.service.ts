
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

}