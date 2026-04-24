'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    // Create profile
    await supabase.from('profiles').insert({
      id: data.user.id,
      full_name: name,
      email: email,
      role: 'subscriber'
    })

    setMessage('Account created! Please check your email.')
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
        <h2 style={{ marginBottom: '24px', color: '#22c55e' }}>
          Create Account
        </h2>

        <input
          placeholder="Full Name"
          value={name}
          onChange={e => setName(e.target.value)}
          style={inputStyle}
        />
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

        <button onClick={handleSignup} style={buttonStyle}>
          Sign Up
        </button>

        {message && (
          <p style={{ marginTop: '16px', color: '#22c55e' }}>{message}</p>
        )}

        <p style={{ marginTop: '16px', color: '#aaa' }}>
          Already have an account? <a href="/login" style={{ color: '#22c55e' }}>Login</a>
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