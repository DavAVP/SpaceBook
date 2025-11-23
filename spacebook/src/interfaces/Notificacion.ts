export interface INotificaciones{
    id_notificacion: string;
    usuario_id: string;
    reserva_id: string | null;
    mensaje: string;
    fecha_envio: string;
}