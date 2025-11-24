import { render, screen } from '@testing-library/react';
import Penalizacion from './penalizacion';

jest.mock('../../../services/penalizacion.service', () => ({
  PenalizacionService: {
    ObtenerPenalizaciones: jest.fn().mockResolvedValue([]),
    usuarioEstaPenalizado: jest.fn().mockResolvedValue(false),
    crearPenalizacion: jest.fn().mockResolvedValue(true),
  },
}));
jest.mock('../../../services/reserva.service', () => ({
  ReservaService: {
    ObtenerReserva: jest.fn().mockResolvedValue([]),
    ActualizarReserva: jest.fn().mockResolvedValue(true),
  },
}));
jest.mock('../../../services/espacio.service', () => ({
  EspacioService: {
    ObtenerEspacios: jest.fn().mockResolvedValue([]),
  },
}));

describe('Penalizacion', () => {
  it('muestra el panel de penalizaciones', async () => {
    render(<Penalizacion />);
    expect(await screen.findByText(/Panel de Penalizaciones/i)).toBeInTheDocument();
  });
});
