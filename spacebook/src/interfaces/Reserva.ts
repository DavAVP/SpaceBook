export interface IReserva{
    id_reserva?: string;
    usuario_id: string;
    espacio_id: string;
    hora_inicio: string;
    hora_fin: string;
    estado: string;
    fecha_reserva: string;
    fecha_cancelacion: string | null;  
}