import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './login';

const { mockNavigate, handleLoginMock, singleMock } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  handleLoginMock: vi.fn(),
  singleMock: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../services/auth.service', () => {
  const supabaseChain = {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: singleMock,
        })),
      })),
    })),
  };

  return {
    AuthService: {
      HandleLogin: handleLoginMock,
      supabase: supabaseChain,
    },
  };
});

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    handleLoginMock.mockReset();
    singleMock.mockReset();
  });

  it('muestra errores de validación cuando los campos están vacíos', async () => {
    render(<Login />);

    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(screen.getByText(/campo de usuario es necesario/i)).toBeInTheDocument();
    expect(screen.getByText(/campo de contraseña es necesario/i)).toBeInTheDocument();
    expect(handleLoginMock).not.toHaveBeenCalled();
  });

  it('muestra mensaje de error si las credenciales no son válidas', async () => {
    handleLoginMock.mockResolvedValue(null);

    render(<Login />);

    await userEvent.type(screen.getByPlaceholderText(/email/i), 'usuario@test.com');
    await userEvent.type(screen.getByPlaceholderText(/password/i), '123456');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText(/usuario o password invalidos/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('redirige al panel de admin cuando el perfil es administrador', async () => {
    handleLoginMock.mockResolvedValue({ id: 'user-123' });
    singleMock.mockResolvedValue({ data: { is_admin: true } });

    render(<Login />);

    await userEvent.type(screen.getByPlaceholderText(/email/i), 'admin@test.com');
    await userEvent.type(screen.getByPlaceholderText(/password/i), '123456');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });
  });

  it('redirige al home cuando el perfil no es admin', async () => {
    handleLoginMock.mockResolvedValue({ id: 'user-123' });
    singleMock.mockResolvedValue({ data: { is_admin: false } });

    render(<Login />);

    await userEvent.type(screen.getByPlaceholderText(/email/i), 'user@test.com');
    await userEvent.type(screen.getByPlaceholderText(/password/i), '123456');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });
});

