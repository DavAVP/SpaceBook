import React, { useState } from "react";
import { HoraDisponibleService } from "../../../services/horaDisponible.service";
import "../../../styles/horarioDisponible.css";

interface Props {
    idEspacio: string;
    onFinish: () => void;
}

export default function AgregarHorario({ idEspacio, onFinish }: Props) {
    const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>([]);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    const ListaDiaSemana = [
      'lunes',
      'martes',
      'miercoles',
      'jueves',
      'viernes',
      'sabado',
      'domingo', 
    ];

    const toggleDia = (dia: string) => {
        setDiasSeleccionados(prev => 
            prev.includes(dia) 
                ? prev.filter(d => d !== dia) //esto hace que si el día ya está seleccionado, lo quita
                : [...prev, dia] //si no está seleccionado, lo agrega
        );
    };

    const handleAddHorarios = async (e: React.FormEvent) => {
        e.preventDefault();
        setMensaje("");
        setError("");

        //validacion para que no ponga menos de 1 dia
        if (diasSeleccionados.length === 0) {
            setError("Debes seleccionar al menos un día");
            return;
        }

        try {
            // Crear un horario disponible por cada día seleccionado
            const promesas = diasSeleccionados.map(dia => {
                const horario = {
                    id_horario: crypto.randomUUID(), // Genera un ID único para el horario
                    espacio_id: idEspacio, // Asigna el ID del espacio
                    dia_semana: dia,
                    horario_apertura: "00:00", // Ya no es relevante, se define todo el dia por defecto
                    horario_cierre: "23:59",
                    ocupado: false // Identifica si el horario está ocupado
                };
                return HoraDisponibleService.crearHoraDisponible(horario);
            });

            const resultados = await Promise.all(promesas);
            
            if (resultados.every(r => r)) {
                setMensaje(`${diasSeleccionados.length} día(s) agregado(s) correctamente`);
                setDiasSeleccionados([]);
            } else {
                setError("Algunos días no se pudieron agregar");
            }
        } catch (err) {
            setError("Error al agregar los días disponibles");
            console.error(err);
        }
    };

    return (
        <div className="admin-card admin-horario-card">
            <h4>Configurar Días Disponibles del Espacio</h4>
            <p className="text-muted">Selecciona los días en que este espacio estará disponible para reservas</p>
            
            {mensaje && <div className="alert alert-success">{mensaje}</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            
            <form onSubmit={handleAddHorarios}>
                <div className="dias-container mb-3">
                    {ListaDiaSemana.map((dia) => (
                        <div key={dia} className="form-check">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id={`dia-${dia}`}
                                checked={diasSeleccionados.includes(dia)}
                                onChange={() => toggleDia(dia)}
                            />
                            <label className="form-check-label" htmlFor={`dia-${dia}`}>
                                {dia.charAt(0).toUpperCase() + dia.slice(1)}
                            </label>
                        </div>
                    ))}
                </div>

                <div className="col-12 mt-3">
                    <button type="submit" className="btn btn-primary">
                        Guardar Días Disponibles
                    </button>
                    <button type="button" className="btn btn-secondary ms-2" onClick={onFinish}>
                        Terminar
                    </button>
                </div>
            </form>
        </div>
    );
}