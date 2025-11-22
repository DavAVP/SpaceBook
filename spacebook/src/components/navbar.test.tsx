import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from './navbar';

const { mockNavigate, mockGetSession, mockOnAuthStateChange, mockSignOut, mockFrom } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockGetSession: vi.fn(),
  mockOnAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
  mockSignOut: vi.fn(),
  mockFrom: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../services/auth.service', () => {
  return {
    AuthService: {
      supabase: {
        auth: {
          getSession: mockGetSession,
          onAuthStateChange: mockOnAuthStateChange,
          signOut: mockSignOut,
        },
        from: mockFrom,
      },
    },
  };
});

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    mockGetSession.mockReset();
    mockSignOut.mockReset();
    mockFrom.mockReset();
  });

  it('muestra botones de login y registro cuando no hay usuario', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });

    render(<Navbar />);

    await waitFor(() => {
      expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument();
      expect(screen.getByText(/registrarse/i)).toBeInTheDocument();
    });
  });

  it('muestra información del usuario cuando está autenticado', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
    };
    const mockProfile = {
      nombre: 'Juan',
      is_admin: false,
    };

    mockGetSession.mockResolvedValue({ data: { session: mockSession } });
    
    const selectMock = vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn().mockResolvedValue({ data: mockProfile }),
      })),
    }));
    
    mockFrom.mockReturnValue({ select: selectMock });

    render(<Navbar />);

    await waitFor(() => {
      expect(screen.getByText(/juan/i)).toBeInTheDocument();
      expect(screen.getByText(/cliente/i)).toBeInTheDocument();
    });
  });

  it('muestra badge de admin cuando el usuario es administrador', async () => {
    const mockSession = {
      user: { id: 'admin-123', email: 'admin@example.com' },
    };
    const mockProfile = {
      nombre: 'Admin',
      is_admin: true,
    };

    mockGetSession.mockResolvedValue({ data: { session: mockSession } });
    
    const selectMock = vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn().mockResolvedValue({ data: mockProfile }),
      })),
    }));
    
    mockFrom.mockReturnValue({ select: selectMock });

    render(<Navbar />);

    await waitFor(() => {
      // Buscamos todos los elementos con "Admin" y verificamos que al menos uno está en el badge
      const adminElements = screen.getAllByText(/admin/i);
      expect(adminElements.length).toBeGreaterThan(0);
      // Verificamos que hay un badge con clase admin
      const adminBadge = document.querySelector('.user-badge.admin');
      expect(adminBadge).toBeInTheDocument();
    });
  });

  it('navega al hacer clic en el logo', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });

    render(<Navbar />);

    await waitFor(() => {
      const logo = screen.getByText(/reservaspace/i);
      expect(logo).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText(/reservaspace/i));
    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });

  it('maneja el logout correctamente', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
    };
    const mockProfile = { nombre: 'Test', is_admin: false };

    mockGetSession.mockResolvedValue({ data: { session: mockSession } });
    mockSignOut.mockResolvedValue({ error: null });
    
    const selectMock = vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn().mockResolvedValue({ data: mockProfile }),
      })),
    }));
    
    mockFrom.mockReturnValue({ select: selectMock });

    render(<Navbar />);

    await waitFor(() => {
      expect(screen.getByText(/test/i)).toBeInTheDocument();
    });

    // Abrir menú de usuario
    await userEvent.click(screen.getByText(/test/i));

    // Hacer clic en cerrar sesión
    const logoutButton = await screen.findByText(/cerrar sesión/i);
    await userEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});

