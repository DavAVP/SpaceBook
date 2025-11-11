import { supabase } from "../api/supabase.config"

export const StorageService = {
    async uploadfile(file: { name: any; }, userId: string){
        const filePath = `${userId}/${crypto.randomUUID()}-${file.name}`;
        const {error} = await supabase.storage.from('EspaciosStorage').upload(filePath, file,{
            upsert: true
        });
        if(error){
            throw error;
        }
        const {data: publicData} = await supabase.storage.from('EspaciosStorage').getPublicUrl(filePath);
        return {
            url: publicData.publicUrl,
            path: filePath 
        }
    },

    async getPublicUrl(path: string){
        const {data} = supabase.storage.from('EspaciosStorage').getPublicUrl(path)
        return data.publicUrl
    },

    async updateFile(file: File, path: string){
        const {data, error} = await supabase.storage.from('EspaciosStorage').upload(path, file,{
            upsert: true
        });
        if(error) throw error;
        return data; 
    },

    async deleteFile(path: string){
        const {data, error} = await supabase.storage.from('EspaciosStorage').remove([path]);
        if ( error ) throw error;
        return data;
    }
}

