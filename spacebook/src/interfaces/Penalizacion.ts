export interface IPenalizacion {
    id_penalizacion: string;
    usuario_id: string;
    motivo: string;
    fecha_inicio: string;
    fecha_final: string;
    estado_penalizacion: boolean;
}