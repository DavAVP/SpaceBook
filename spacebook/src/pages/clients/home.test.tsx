import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from './home';

let mockLoadingValue = false;

const { mockUser, mockObtenerEspacios } = vi.hoisted(() => ({
  mockUser: { id: 'user-123', is_admin: false },
  mockObtenerEspacios: vi.fn(),
}));

vi.mock('../../context/usuario.context', () => ({
  useUser: () => ({
    user: mockUser,
    loading: mockLoadingValue,
  }),
}));

vi.mock('../../services/espacio.service', () => ({
  EspacioService: {
    ObtenerEspacios: mockObtenerEspacios,
  },
}));

// Mock de window.location
Object.defineProperty(window, 'location', {
  value: {
    href: '',
  },
  writable: true,
});

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockObtenerEspacios.mockReset();
    window.location.href = '';
  });

  it('muestra mensaje de carga inicialmente', () => {
    mockLoadingValue = true;
    mockObtenerEspacios.mockImplementation(() => new Promise(() => {})); // Nunca resuelve

    render(<Home />);

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
    mockLoadingValue = false; // Reset
  });

  it('muestra espacios disponibles después de cargar', async () => {
    mockLoadingValue = false;
    const mockEspacios = [
      {
        id_espacio: 1,
        nombre_lugar: 'Sala de Reuniones A',
        descripcion: 'Espacio para reuniones',
        ubicacion: 'Piso 1',
        foto_url: 'https://example.com/foto.jpg',
        espacio_disponible: true,
      },
      {
        id_espacio: 2,
        nombre_lugar: 'Sala de Reuniones B',
        descripcion: 'Otro espacio',
        ubicacion: 'Piso 2',
        foto_url: null,
        espacio_disponible: true,
      },
    ];

    mockObtenerEspacios.mockResolvedValue(mockEspacios);

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/bienvenido a spacebooksss/i)).toBeInTheDocument();
      expect(screen.getByText(/sala de reuniones a/i)).toBeInTheDocument();
      expect(screen.getByText(/sala de reuniones b/i)).toBeInTheDocument();
    });
  });

  it('no muestra espacios no disponibles', async () => {
    mockLoadingValue = false;
    const mockEspacios = [
      {
        id_espacio: 1,
        nombre_lugar: 'Sala Disponible',
        descripcion: 'Disponible',
        ubicacion: 'Piso 1',
        foto_url: null,
        espacio_disponible: true,
      },
      {
        id_espacio: 2,
        nombre_lugar: 'Sala No Disponible',
        descripcion: 'No disponible',
        ubicacion: 'Piso 2',
        foto_url: null,
        espacio_disponible: false,
      },
    ];

    mockObtenerEspacios.mockResolvedValue(mockEspacios);

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/sala disponible/i)).toBeInTheDocument();
      expect(screen.queryByText(/sala no disponible/i)).not.toBeInTheDocument();
    });
  });

  it('maneja errores al cargar espacios', async () => {
    mockLoadingValue = false;
    mockObtenerEspacios.mockRejectedValue(new Error('Error de red'));

    render(<Home />);

    await waitFor(() => {
      // Debería mostrar el mensaje de bienvenida aunque no haya espacios
      expect(screen.getByText(/bienvenido a spacebooksss/i)).toBeInTheDocument();
    });
  });

  it('navega a la página de reserva al hacer clic en el botón', async () => {
    mockLoadingValue = false;
    const mockEspacios = [
      {
        id_espacio: 1,
        nombre_lugar: 'Sala de Reuniones',
        descripcion: 'Descripción',
        ubicacion: 'Piso 1',
        foto_url: null,
        espacio_disponible: true,
      },
    ];

    mockObtenerEspacios.mockResolvedValue(mockEspacios);

    render(<Home />);

    await waitFor(() => {
      const reservarButton = screen.getByRole('button', { name: /reservar/i });
      expect(reservarButton).toBeInTheDocument();
    });

    const reservarButton = screen.getByRole('button', { name: /reservar/i });
    await userEvent.click(reservarButton);

    expect(window.location.href).toBe('/reservar/1');
  });
});

