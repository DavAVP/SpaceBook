import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SubirEspacios from './subirEspacios';

// Mock de contexto de usuario admin
import { vi } from 'vitest';
import { UserContext } from '../../context/usuario.context';

vi.mock('../../services/espacio.service', () => ({
  EspacioService: {
    crearEspacio: vi.fn().mockResolvedValue(true),
  },
}));
vi.mock('../../services/storage.service', () => ({
  StorageService: {
    uploadfile: vi.fn().mockResolvedValue({ path: 'fakepath', url: 'fakeurl' }),
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

describe('SubirEspacios', () => {
  it('muestra el formulario de subir espacio', () => {
    render(
      <BrowserRouter>
        <UserContext.Provider value={{ user: fakeUser, loading: false }}>
          <SubirEspacios />
        </UserContext.Provider>
      </BrowserRouter>
    );
    expect(screen.getByText(/Subir Nuevo Espacio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre del Lugar/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descripción/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo de Espacio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ubicación/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Capacidad/i)).toBeInTheDocument();
  });
});
