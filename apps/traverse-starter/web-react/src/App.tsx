import { useState, useEffect } from 'react'

function App() {
  const runtimeUrl = import.meta.env.VITE_TRAVERSE_RUNTIME_URL || 'http://localhost:3000'
  const [note, setNote] = useState('')
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  useEffect(() => {
    let active = true
    const checkHealth = async () => {
      try {
        const res = await fetch(`${runtimeUrl}/health`, { method: 'GET' })
        if (res.ok && active) {
          setStatus('online')
        } else if (active) {
          setStatus('offline')
        }
      } catch {
        if (active) {
          setStatus('offline')
        }
      }
    }

    checkHealth()
    const interval = setInterval(checkHealth, 5000)

    return () => {
      active = false
      clearInterval(interval)
    }
  }, [runtimeUrl])

  const handleStartWorkflow = (e: React.FormEvent) => {
    e.preventDefault()
    // Workflow start boundary will be integrated in Ticket 3
    console.log('Start workflow with input:', { note })
  }

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      {/* Header */}
      <header style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 700, 
          letterSpacing: '-0.03em',
          background: 'linear-gradient(to right, #a78bfa, #06b6d4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '8px'
        }}>
          Traverse Starter
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
          Reference UI client for Traverse runtime integration
        </p>
      </header>

      {/* Grid Layout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Status / Config Panel */}
        <section className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', fontWeight: 600 }}>
            Runtime Environment
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Discovery Endpoint
              </div>
              <div style={{ fontSize: '1rem', color: 'var(--text-primary)', marginTop: '4px', wordBreak: 'break-all' }}>
                {runtimeUrl}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Runtime Status
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span style={{
                  display: 'inline-block',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: status === 'online' ? '#06b6d4' : status === 'offline' ? '#ef4444' : '#64748b',
                  boxShadow: status === 'online' ? '0 0 10px rgba(6, 182, 212, 0.6)' : status === 'offline' ? '0 0 10px rgba(239, 68, 68, 0.6)' : 'none'
                }} />
                <span style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  {status === 'online' ? 'Online' : status === 'offline' ? 'Offline' : 'Checking...'}
                </span>
              </div>
            </div>
          </div>
          <div style={{ 
            marginTop: '20px', 
            paddingTop: '16px', 
            borderTop: '1px solid rgba(255,255,255,0.05)',
            fontSize: '0.85rem', 
            color: 'var(--text-muted)' 
          }}>
            Configured to execute tasks using the pinned Traverse release. For active local framework testing, override using <code>TRAVERSE_REPO=/path/to/Traverse</code>.
          </div>
        </section>

        {/* Input / Control Panel */}
        <section className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', fontWeight: 600 }}>
            Start Workflow
          </h2>
          <form onSubmit={handleStartWorkflow}>
            <div style={{ marginBottom: '20px' }}>
              <label 
                htmlFor="note-input"
                style={{ 
                  display: 'block', 
                  fontSize: '0.85rem', 
                  color: 'var(--text-muted)', 
                  marginBottom: '8px',
                  fontWeight: 500
                }}
              >
                Starter Input Note
              </label>
              <textarea
                id="note-input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Enter a note or starter input to trigger the Traverse workflow..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '12px',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-glow)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.95rem',
                  resize: 'vertical',
                  outline: 'none',
                  transition: 'var(--transition-smooth)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-glow)'}
              />
            </div>
            <button 
              type="submit" 
              className="btn-glow"
              disabled={!note.trim() || status !== 'online'}
              style={{ width: '100%' }}
            >
              Start Workflow
            </button>
          </form>
        </section>

        {/* Output Panel Placeholder */}
        <section className="glass-panel" style={{ padding: '24px', minHeight: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '380px' }}>
            <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Event Subscription & Result Flow
            </p>
            <p>
              Once a workflow starts, the events and final output fields (Title, Tags, Note Type, Next Action, Status) will render here.
            </p>
            <div style={{ 
              marginTop: '16px', 
              fontSize: '0.8rem', 
              display: 'inline-block', 
              padding: '4px 12px', 
              background: 'rgba(139, 92, 246, 0.15)', 
              color: 'var(--color-accent)', 
              borderRadius: '20px',
              fontWeight: 500
            }}>
              Pending connection in Ticket 3 & 4
            </div>
          </div>
        </section>
        
      </div>
    </div>
  )
}

export default App
