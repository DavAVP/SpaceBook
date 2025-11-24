import { render, screen } from '@testing-library/react';
import Reservar from './reservar';

describe('Reservar', () => {
  it('muestra el título y formulario de reserva', () => {
    render(<Reservar />);
    expect(screen.getByText(/Reservar Espacio/i)).toBeInTheDocument();
    expect(screen.getByText(/Selecciona tu Horario/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Confirmar Reserva/i })).toBeInTheDocument();
  });
});
