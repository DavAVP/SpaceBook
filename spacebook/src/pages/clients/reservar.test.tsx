import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Reservar from './reservar';

import { vi } from 'vitest';
vi.mock('../../context/usuario.context', () => ({
  useUser: () => ({ user: { id: 'user1' }, loading: false }),
}));

vi.mock('../../services/espacio.service', () => ({
  EspacioService: {
    ObtenerEspacioID: vi.fn().mockResolvedValue({
      id_espacio: '1', nombre_lugar: 'Aula 1', descripcion: 'desc', tipo: 'aula', ubicacion: 'edif', capacidad: 10, foto_url: '', espacio_disponible: true
    }),
  },
}));

vi.mock('../../services/horaDisponible.service', () => ({
  HoraDisponibleService: {
    ObtenerHoraDisponibles: vi.fn().mockResolvedValue([]),
  },
}));

describe('Reservar', () => {
  it('muestra el título y formulario de reserva', async () => {
    render(
      <BrowserRouter>
        <Reservar />
      </BrowserRouter>
    );
    expect(await screen.findByText(/Reservar Espacio/i)).toBeInTheDocument();
    expect(screen.getByText(/Selecciona tu Horario/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Confirmar Reserva/i })).toBeInTheDocument();
  });
});
