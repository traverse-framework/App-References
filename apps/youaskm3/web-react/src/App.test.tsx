import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the app title', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /youaskm3/i })).toBeInTheDocument()
  })

  it('shows the default runtime URL', () => {
    render(<App />)
    expect(screen.getByText(/localhost:3000/)).toBeInTheDocument()
  })
})
