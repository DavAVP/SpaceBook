import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Login from './login'

vi.mock('../services/auth.service', () => ({
  AuthService: {
    HandleLogin: vi.fn()
  }
}))

describe('Login page', () => {
  it('muestra el título y enlace de registro', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    expect(screen.getByText(/Login/i)).toBeInTheDocument()
    expect(screen.getByText(/Regístrate/i)).toBeInTheDocument()
  })
})
