import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Register from './register'

vi.mock('../services/auth.service', () => ({
  AuthService: {
    HandleSingUp: vi.fn()
  }
}))

describe('Register page', () => {
  it('muestra el título de registro', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    )

    expect(screen.getByText(/Registro/i)).toBeInTheDocument()
  })
})
