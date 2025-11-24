import { render, screen } from '@testing-library/react';
import EditarHorarios from './EditarHorarios';

describe('EditarHorarios', () => {
  it('muestra el título y los días de la semana', () => {
    render(<EditarHorarios idEspacio="1" />);
    expect(screen.getByText(/Editar Días Disponibles/i)).toBeInTheDocument();
    expect(screen.getByText(/Selecciona los días en que este espacio estará disponible/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Guardar dias disponibles/i })).toBeInTheDocument();
  });
});
