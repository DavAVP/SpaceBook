import { render, screen } from '@testing-library/react';
import MisReservas from './MisReservar';

describe('MisReservas', () => {
  it('muestra el título y mensaje si no hay reservas', () => {
    render(<MisReservas />);
    expect(screen.getByText(/Mis Reservas/i)).toBeInTheDocument();
    expect(screen.getByText(/No tienes reservas/i)).toBeInTheDocument();
  });
});
