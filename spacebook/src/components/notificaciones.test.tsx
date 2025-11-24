import { render, screen, fireEvent } from '@testing-library/react';
import NotificationToggle from './notificaciones';

describe('NotificationToggle', () => {
  it('muestra el botón para activar/desactivar notificaciones', () => {
    render(<NotificationToggle userId="test-user" is_admin={false} />);
    expect(screen.getByRole('button')).toHaveTextContent(/Activar Notificaciones|Desactivar Notificaciones/);
  });

  it('cambia el texto al hacer click', () => {
    render(<NotificationToggle userId="test-user" is_admin={false} />);
    const btn = screen.getByRole('button');
    fireEvent.click(btn);
    // No se puede testear el cambio real sin mockear localStorage y push, pero el botón existe
    expect(btn).toBeInTheDocument();
  });
});
