import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomeInvitado from './homeInvitado';

import { vi } from 'vitest';
vi.mock('../services/espacio.service', () => ({
  EspacioService: {
    ObtenerEspacios: vi.fn().mockResolvedValue([]),
  },
}));
vi.mock('../services/categoria.service', () => ({
  CategoriaService: {
    obtenerCategorias: vi.fn().mockResolvedValue([]),
  },
}));

describe('HomeInvitado', () => {
  it('muestra el mensaje de bienvenida', async () => {
    render(
      <BrowserRouter>
        <HomeInvitado />
      </BrowserRouter>
    );
    expect(await screen.findByText(/Bienvenido a SpaceBooks/i)).toBeInTheDocument();
    expect(await screen.findByText(/¡Inicia sesión para reservar tus espacios favoritos!/i)).toBeInTheDocument();
  });
});