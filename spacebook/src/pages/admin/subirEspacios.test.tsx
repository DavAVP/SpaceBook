import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SubirEspacios from './subirEspacios';

// Mock de contexto de usuario admin
import { vi } from 'vitest';
vi.mock('../../context/usuario.context', () => ({
  UserContext: {
    Provider: ({ children }: any) => children,
  },
  useUser: () => ({ user: { is_admin: true, id: 'admin' }, loading: false }),
}));

describe('SubirEspacios', () => {
  it('muestra el formulario de subir espacio', () => {
    render(
      <BrowserRouter>
        <SubirEspacios />
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
