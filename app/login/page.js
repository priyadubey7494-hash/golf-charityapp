'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setMessage(error.message)
      return
    }

    router.push('/dashboard')
  }

  return (
    <main style={{
      background: '#0a0a0a',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white'
    }}>
      <div style={{
        background: '#1a1a1a',
        padding: '40px',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ marginBottom: '24px', color: '#22c55e' }}>Login</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button onClick={handleLogin} style={buttonStyle}>
          Login
        </button>

        {message && (
          <p style={{ marginTop: '16px', color: '#f87171' }}>{message}</p>
        )}

        <p style={{ marginTop: '16px', color: '#aaa' }}>
          No account? <a href="/signup" style={{ color: '#22c55e' }}>Sign Up</a>
        </p>
      </div>
    </main>
  )
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  marginBottom: '16px',
  background: '#2a2a2a',
  border: '1px solid #333',
  borderRadius: '8px',
  color: 'white',
  fontSize: '16px',
  boxSizing: 'border-box'
}

const buttonStyle = {
  width: '100%',
  padding: '14px',
  background: '#22c55e',
  color: 'black',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 'bold',
  fontSize: '16px',
  cursor: 'pointer'
}