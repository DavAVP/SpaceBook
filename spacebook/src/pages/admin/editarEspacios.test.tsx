import { render, screen } from '@testing-library/react';
import EditarEspacios from './editarEspacios';

describe('EditarEspacios', () => {
  it('muestra el título y formulario de edición', () => {
    render(<EditarEspacios />);
    expect(screen.getByText(/Editar Espacio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre del Lugar/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descripción/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ubicación/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Capacidad/i)).toBeInTheDocument();
  });
});
