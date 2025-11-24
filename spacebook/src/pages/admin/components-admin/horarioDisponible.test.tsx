import { render, screen } from '@testing-library/react';
import HorarioDisponible from './horarioDisponible';

describe('HorarioDisponible', () => {
  it('muestra el título y los días de la semana', () => {
    render(<HorarioDisponible idEspacio="1" onFinish={() => {}} />);
    expect(screen.getByText(/Configurar Días Disponibles del Espacio/i)).toBeInTheDocument();
    expect(screen.getByText(/Selecciona los días en que este espacio estará disponible/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Guardar Días Disponibles/i })).toBeInTheDocument();
  });
});
