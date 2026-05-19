'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: '#0f1923'
    }}>
      {/* Left panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '4rem',
        borderRight: '1px solid #1e2d3d'
      }}>
        <div style={{ fontFamily: 'monospace', fontSize: '24px', fontWeight: '700', color: '#00d4ff', marginBottom: '8px' }}>
          Bharyat <span style={{ color: 'white' }}>AI</span>
        </div>
        <div style={{ fontSize: '13px', color: '#4a6a8a', fontFamily: 'monospace', marginBottom: '3rem' }}>
          BOM Intelligence Platform
        </div>
        <h2 style={{ fontSize: '32px', fontWeight: '700', color: 'white', marginBottom: '12px', lineHeight: 1.2 }}>
          Optimize your<br />
          <span style={{ color: '#00d4ff' }}>component supply chain</span>
        </h2>
        <p style={{ fontSize: '14px', color: '#4a6a8a', lineHeight: 1.7 }}>
          AI-powered BOM analysis, risk scoring,<br />
          alternate sourcing, and savings intelligence.
        </p>

        <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { color: '#00d4ff', text: '$1.8M savings identified across active BOMs' },
            { color: '#00ff9d', text: '34 high-risk components flagged automatically' },
            { color: '#ffb347', text: 'AI alternates with engineering validation built-in' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.color, flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: '#7a9ab5' }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - login form */}
      <div style={{
        width: '420px', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '4rem'
      }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>
          Sign in
        </h3>
        <p style={{ fontSize: '13px', color: '#4a6a8a', marginBottom: '2rem' }}>
          Enter your credentials to continue
        </p>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#7a9ab5', marginBottom: '6px', fontWeight: '500' }}>
            EMAIL
          </label>
          <input
            type="email"
            placeholder="you@bharyat.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: '100%', padding: '12px 14px',
              background: '#151f2b', border: '1px solid #1e2d3d',
              borderRadius: '6px', color: 'white', fontSize: '14px',
              outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#7a9ab5', marginBottom: '6px', fontWeight: '500' }}>
            PASSWORD
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%', padding: '12px 14px',
              background: '#151f2b', border: '1px solid #1e2d3d',
              borderRadius: '6px', color: 'white', fontSize: '14px',
              outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        {error && (
          <div style={{
            padding: '10px 14px', background: 'rgba(255,85,85,0.1)',
            border: '1px solid rgba(255,85,85,0.3)', borderRadius: '6px',
            color: '#ff8888', fontSize: '13px', marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%', padding: '12px',
            background: loading ? '#1e2d3d' : '#00d4ff',
            color: loading ? '#4a6a8a' : '#0f1923',
            border: 'none', borderRadius: '6px',
            fontSize: '14px', fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer',
            letterSpacing: '0.05em'
          }}
        >
          {loading ? 'Signing in...' : 'SIGN IN →'}
        </button>
      </div>
    </div>
  )
}