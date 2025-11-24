import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import Reservar from './reservar';
import { UserContext } from '../../context/usuario.context';

vi.mock('../../services/espacio.service', () => ({
  EspacioService: {
    ObtenerEspacioID: vi.fn().mockResolvedValue({
      id_espacio: '1', nombre_lugar: 'Aula 1', descripcion: 'desc', tipo: 'aula', ubicacion: 'edif', capacidad: 10, foto_url: '', espacio_disponible: true
    }),
  },
}));
vi.mock('../../services/horaDisponible.service', () => ({
  HoraDisponibleService: {
    ObtenerHoraDisponibles: vi.fn().mockResolvedValue([
      { espacio_id: '1', dia_semana: 'lunes', id_horario: 'h1' }
    ]),
  },
}));

const fakeUser = {
  id: 'user1',
  app_metadata: {},
  user_metadata: {},
  aud: '',
  created_at: ''
};

describe('Reservar', () => {
  it('muestra el título y formulario de reserva', async () => {
    render(
      <UserContext.Provider value={{ user: fakeUser, loading: false }}>
        <MemoryRouter initialEntries={["/reservar/1"]}>
          <Routes>
            <Route path="/reservar/:id" element={<Reservar />} />
          </Routes>
        </MemoryRouter>
      </UserContext.Provider>
    );
    expect(await screen.findByText(/Reservar Espacio/i)).toBeInTheDocument();
    expect(screen.getByText(/Selecciona tu Horario/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Confirmar Reserva/i })).toBeInTheDocument();
  });
});
