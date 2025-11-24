import { render, screen } from '@testing-library/react';
import Penalizacion from './penalizacion';

describe('Penalizacion', () => {
  it('muestra el panel de penalizaciones', () => {
    render(<Penalizacion />);
    expect(screen.getByText(/Panel de Penalizaciones/i)).toBeInTheDocument();
    expect(screen.getByText(/Lista de usuarios con reservas vencidas o pendientes/i)).toBeInTheDocument();
  });
});
