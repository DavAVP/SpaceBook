import { render, screen } from '@testing-library/react';
import HomeInvitado from './homeInvitado';

describe('HomeInvitado', () => {
  it('muestra el mensaje de bienvenida', () => {
    render(<HomeInvitado />);
    expect(screen.getByText(/Bienvenido a SpaceBooks/i)).toBeInTheDocument();
    expect(screen.getByText(/¡Inicia sesión para reservar tus espacios favoritos!/i)).toBeInTheDocument();
  });
});
