import { render, screen } from '@testing-library/react';
import Penalizacion from './penalizacion';

import { vi } from 'vitest';
vi.mock('../../../services/penalizacion.service', () => ({
  PenalizacionService: {
    ObtenerPenalizaciones: vi.fn().mockResolvedValue([]),
    usuarioEstaPenalizado: vi.fn().mockResolvedValue(false),
    crearPenalizacion: vi.fn().mockResolvedValue(true),
  },
}));
vi.mock('../../../services/reserva.service', () => ({
  ReservaService: {
    ObtenerReserva: vi.fn().mockResolvedValue([]),
    ActualizarReserva: vi.fn().mockResolvedValue(true),
  },
}));
vi.mock('../../../services/espacio.service', () => ({
  EspacioService: {
    ObtenerEspacios: vi.fn().mockResolvedValue([]),
  },
}));

describe('Penalizacion', () => {
  it('muestra el panel de penalizaciones', async () => {
    render(<Penalizacion />);
    expect(await screen.findByText(/Panel de Penalizaciones/i)).toBeInTheDocument();
  });
});
