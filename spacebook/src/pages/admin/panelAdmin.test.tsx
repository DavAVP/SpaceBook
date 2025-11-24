import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PanelAdmin from './panelAdmin';

import { vi } from 'vitest';
vi.mock('../../context/usuario.context', () => ({
  useUser: () => ({ user: { is_admin: true }, loading: false }),
}));

vi.mock('../../services/espacio.service', () => ({
  EspacioService: {
    ObtenerEspacios: vi.fn().mockResolvedValue([]),
    EliminarEspacio: vi.fn().mockResolvedValue(true),
  },
}));

describe('PanelAdmin', () => {
  it('muestra el título y botón de crear espacio', async () => {
    render(
      <BrowserRouter>
        <PanelAdmin />
      </BrowserRouter>
    );
    expect(await screen.findByText(/Bienvenido a panel del admin/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Crear Nuevo Espacio/i })).toBeInTheDocument();
  });
});
