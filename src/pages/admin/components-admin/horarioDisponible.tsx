import React, { useState } from "react";
import { HoraDisponibleService } from "../../../services/horaDisponible.service";
import "../../../styles/horarioDisponible.css";

interface Props {
    idEspacio: string;
    onFinish: () => void;
}

export default function AgregarHorario({ idEspacio, onFinish }: Props) {
    const [horaInicio, setHoraInicio] = useState("");
    const [horaFin, setHoraFin] = useState("");
    const [diaSemana, setSemana] = useState("");
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

    const handleAddHorario = async (e: React.FormEvent) => {
        e.preventDefault();
        setMensaje("");
        setError("");

        const horario = {
            id_horario: crypto.randomUUID(),
            espacio_id: idEspacio,
            dia_semana: diaSemana,
            horario_apertura: horaInicio,
            horario_cierre: horaFin
        };

        const result = await HoraDisponibleService.crearHoraDisponible(horario);

        if (result) {
            setMensaje("Horario agregado");
            setSemana("");
            setHoraInicio("");
            setHoraFin("");
        } else {
            setError("No se pudo agregar el horario");
        }
    };

    return (
        <div className="mt-4 p-3 border rounded">
            <h4>Agregar Horarios al Espacio</h4>
        {mensaje && <div className="alert alert-success">{mensaje}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="row g-3" onSubmit={handleAddHorario}>
            <div className="col-md-6">
            <label>dia de la semana</label>
              <select
                className="form-control"
                value={diaSemana}
                onChange={(e) => setSemana(e.target.value)}
                required
              >
                <option value="">Seleccione un día...</option>
                {ListaDiaSemana.map((d) => (
                  <option key={d} value={d}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </option>
                ))}
              </select>
            </div>
        <div className="col-md-6">
          <label>Hora Inicio</label>
          <input
            type="time"
            className="form-control"
            value={horaInicio}
            onChange={(e) => setHoraInicio(e.target.value)}
            required
          />
        </div>

        <div className="col-md-6">
          <label>Hora Fin</label>
          <input
            type="time"
            className="form-control"
            value={horaFin}
            onChange={(e) => setHoraFin(e.target.value)}
            required
          />
        </div>

        <div className="col-12 mt-3">
          <button onClick={handleAddHorario} className="btn btn-primary">Agregar Horario</button>
          <button type="button" className="btn btn-secondary ms-2" onClick={onFinish}>
            Terminar
          </button>
        </div>
      </div>
    </div>
  );
}
