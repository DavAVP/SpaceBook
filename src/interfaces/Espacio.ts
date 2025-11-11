export interface IEspacio{
    id_espacio: string;
    nombre_lugar: string;
    descripcion: string;
    tipo: string;
    ubicacion:string;
    capacidad: number;
    foto_url?: string;
    espacio_disponible: boolean;
}