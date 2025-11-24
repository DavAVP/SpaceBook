import { render, screen } from '@testing-library/react';
import SubirEspacios from './subirEspacios';

describe('SubirEspacios', () => {
  it('muestra el formulario de subir espacio', () => {
    render(<SubirEspacios />);
    expect(screen.getByText(/Subir Nuevo Espacio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre del Lugar/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descripción/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo de Espacio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ubicación/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Capacidad/i)).toBeInTheDocument();
  });
});
