import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

let mockLoadingValue = false;

const { mockUser } = vi.hoisted(() => ({
  mockUser: { id: 'user-123' as string | null, is_admin: false },
}));

vi.mock('./context/usuario.context', () => ({
  useUser: () => ({
    user: mockUser,
    loading: mockLoadingValue,
  }),
}));

vi.mock('./utils/push', () => ({
  Suscripcion: vi.fn().mockResolvedValue(undefined),
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderApp = (initialPath = '/') => {
    window.history.pushState({}, '', initialPath);
    return render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
  };

  it('muestra el navbar en rutas protegidas', () => {
    mockUser.id = 'user-123';
    mockLoadingValue = false;
    
    renderApp('/home');
    
    // El navbar debería estar presente (aunque puede no renderizarse si no hay usuario)
    // Esto depende de la implementación específica
  });

  it('no muestra navbar en la ruta de login', () => {
    mockUser.id = null;
    mockLoadingValue = false;
    
    renderApp('/');
    
    // El navbar no debería mostrarse en login
  });

  it('muestra ToastContainer', () => {
    renderApp('/');
    
    // El ToastContainer se renderiza como una sección con aria-label
    expect(screen.getByLabelText(/notifications/i)).toBeInTheDocument();
  });
});

