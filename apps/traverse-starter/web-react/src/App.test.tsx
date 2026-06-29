import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import App from './App'

describe('App Component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('renders UI shell successfully', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' }),
      } as Response)
    )

    await act(async () => {
      render(<App />)
    })

    // Check header
    expect(screen.getByText('Traverse Starter')).toBeInTheDocument()
    expect(screen.getByText('Reference UI client for Traverse runtime integration')).toBeInTheDocument()

    // Check configuration and fields
    expect(screen.getByText('Discovery Endpoint')).toBeInTheDocument()
    expect(screen.getByText('Runtime Status')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Start Workflow', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start Workflow' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Enter a note or starter input/i)).toBeInTheDocument()
  })

  it('handles offline runtime status', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'))

    render(<App />)

    // Run active effects
    await act(async () => {
      await vi.runOnlyPendingTimersAsync()
    })

    expect(screen.getByText('Offline')).toBeInTheDocument()
    const submitBtn = screen.getByRole('button', { name: 'Start Workflow' })
    expect(submitBtn).toBeDisabled()
  })

  it('handles online runtime status', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'ok' }),
    } as Response)

    render(<App />)

    await act(async () => {
      await vi.runOnlyPendingTimersAsync()
    })

    expect(screen.getByText('Online')).toBeInTheDocument()
  })
})
