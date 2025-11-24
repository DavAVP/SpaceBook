import { render, screen } from '@testing-library/react';
import PanelAdmin from './panelAdmin';

describe('PanelAdmin', () => {
  it('muestra el título y botón de crear espacio', () => {
    render(<PanelAdmin />);
    expect(screen.getByText(/Bienvenido a panel del admin/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Crear Nuevo Espacio/i })).toBeInTheDocument();
  });
});
