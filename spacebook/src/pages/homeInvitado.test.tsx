import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomeInvitado from './homeInvitado';

import { vi } from 'vitest';
vi.mock('../services/espacio.service', () => ({
  EspacioService: {
    ObtenerEspacios: vi.fn().mockResolvedValue([]),
  },
}));

describe('HomeInvitado', () => {
  it('muestra el mensaje de bienvenida', () => {
    render(
      <BrowserRouter>
        <HomeInvitado />
      </BrowserRouter>
    );
    expect(screen.getByText(/Bienvenido a SpaceBooks/i)).toBeInTheDocument();
    expect(screen.getByText(/¡Inicia sesión para reservar tus espacios favoritos!/i)).toBeInTheDocument();
  });
});
