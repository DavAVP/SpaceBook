import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EditarEspacios from './editarEspacios';
import { vi } from 'vitest';
import { UserContext } from '../../context/usuario.context';

vi.mock('../../services/espacio.service', () => ({
  EspacioService: {
    ObtenerEspacioID: vi.fn().mockResolvedValue({
      nombre_lugar: 'Aula 1', descripcion: 'desc', tipo: 'aula', ubicacion: 'edif', capacidad: 10, foto_url: '', espacio_disponible: true
    }),
    ActualizarEspacio: vi.fn().mockResolvedValue(true),
  },
}));

const fakeUser = {
  is_admin: true,
  id: 'admin',
  app_metadata: {},
  user_metadata: {},
  aud: '',
  created_at: ''
};

describe('EditarEspacios', () => {
  it('muestra el título y formulario de edición', async () => {
    render(
      <UserContext.Provider value={{ user: fakeUser, loading: false }}>
        <BrowserRouter>
          <EditarEspacios />
        </BrowserRouter>
      </UserContext.Provider>
    );
    expect(await screen.findByText(/Editar Espacio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre del Lugar/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descripción/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ubicación/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Capacidad/i)).toBeInTheDocument();
  });
});
