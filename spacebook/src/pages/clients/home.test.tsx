import { render, screen } from '@testing-library/react'
import Home from './home'

vi.mock('../../services/espacio.service', () => ({
  EspacioService: {
    ObtenerEspacios: vi.fn(async () => [])
  }
}))

vi.mock('../../context/usuario.context', () => ({
  useUser: () => ({ user: null, loading: false })
}))

describe('Home page', () => {
  it('muestra el texto de bienvenida', async () => {
    render(<Home />)
    expect(await screen.findByText(/Bienvenido a SpaceBook/i)).toBeInTheDocument()
  })
})
