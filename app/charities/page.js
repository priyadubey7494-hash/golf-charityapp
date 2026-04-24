'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function CharitiesPage() {
  const [charities, setCharities] = useState([])
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    getUser()
    fetchCharities()
  }, [])

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchCharities = async () => {
    const { data } = await supabase
      .from('charities')
      .select('*')
      .order('featured', { ascending: false })
    setCharities(data || [])
  }

  const handleSelectCharity = async (charityId) => {
    if (!user) {
      setMessage('Please login first')
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({ charity_id: charityId })
      .eq('id', user.id)

    if (error) {
      setMessage('Failed to select charity')
      return
    }

    setMessage('Charity selected successfully!')
  }

  const filtered = charities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main style={{
      background: '#0a0a0a',
      minHeight: '100vh',
      padding: '40px 20px',
      color: 'white',
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ color: '#22c55e', fontSize: '32px', marginBottom: '8px' }}>
        Choose Your Charity
      </h1>
      <p style={{ color: '#aaa', marginBottom: '32px' }}>
        10% of your subscription goes to your chosen charity
      </p>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search charities..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '12px',
          marginBottom: '32px',
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '8px',
          color: 'white',
          fontSize: '16px',
          boxSizing: 'border-box'
        }}
      />

      {message && (
        <p style={{
          marginBottom: '24px',
          color: message.includes('successfully') ? '#22c55e' : '#f87171'
        }}>
          {message}
        </p>
      )}

      {/* Charity Cards */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        {filtered.length === 0 ? (
          <p style={{ color: '#aaa' }}>No charities found</p>
        ) : (
          filtered.map(charity => (
            <div key={charity.id} style={{
              background: '#1a1a1a',
              border: charity.featured
                ? '2px solid #22c55e'
                : '1px solid #333',
              borderRadius: '16px',
              padding: '24px',
              width: '280px'
            }}>
              {/* Featured Badge */}
              {charity.featured && (
                <span style={{
                  background: '#22c55e',
                  color: 'black',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginBottom: '12px',
                  display: 'inline-block'
                }}>
                  ⭐ Featured
                </span>
              )}

              <h2 style={{
                fontSize: '20px',
                marginBottom: '8px',
                marginTop: charity.featured ? '8px' : '0'
              }}>
                {charity.name}
              </h2>

              <p style={{
                color: '#aaa',
                fontSize: '14px',
                marginBottom: '20px',
                lineHeight: '1.5'
              }}>
                {charity.description}
              </p>

              <button
                onClick={() => handleSelectCharity(charity.id)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#22c55e',
                  color: 'black',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Select This Charity
              </button>
            </div>
          ))
        )}
      </div>

      <a href="/dashboard" style={{
        color: '#22c55e',
        marginTop: '40px',
        display: 'block'
      }}>
        ← Back to Dashboard
      </a>
    </main>
  )
}