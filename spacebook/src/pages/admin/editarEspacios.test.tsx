import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EditarEspacios from './editarEspacios';

import { vi } from 'vitest';
vi.mock('../../context/usuario.context', () => ({
  UserContext: {
    Provider: ({ children }: any) => children,
  },
  useUser: () => ({ user: { is_admin: true, id: 'admin' }, loading: false }),
}));

vi.mock('../../services/espacio.service', () => ({
  EspacioService: {
    ObtenerEspacioID: vi.fn().mockResolvedValue({
      nombre_lugar: 'Aula 1', descripcion: 'desc', tipo: 'aula', ubicacion: 'edif', capacidad: 10, foto_url: '', espacio_disponible: true
    }),
    ActualizarEspacio: vi.fn().mockResolvedValue(true),
  },
}));

describe('EditarEspacios', () => {
  it('muestra el título y formulario de edición', async () => {
    render(
      <BrowserRouter>
        <EditarEspacios />
      </BrowserRouter>
    );
    expect(await screen.findByText(/Editar Espacio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre del Lugar/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descripción/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ubicación/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Capacidad/i)).toBeInTheDocument();
  });
});
