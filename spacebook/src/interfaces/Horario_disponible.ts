export interface IHorarioDisponible{
    id_horario: string;
    espacio_id: string;
    dia_semana: string;
    ocupado: boolean;
    horario_apertura: string;
    horario_cierre: string;
}