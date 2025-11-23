import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from './navbar'

vi.mock('../services/auth.service', () => ({
  AuthService: {
    supabase: {
      auth: {
        getSession: vi.fn(async () => ({ data: { session: null } })),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: () => {} } } }))
      }
    }
  }
}))

describe('Navbar', () => {
  it('muestra botones de iniciar sesión y registrarse cuando no hay usuario', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )

    expect(screen.getByText(/Iniciar Sesión/i)).toBeInTheDocument()
    expect(screen.getByText(/Registrarse/i)).toBeInTheDocument()
  })
})
