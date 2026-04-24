'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [scores, setScores] = useState([])
  const [charity, setCharity] = useState(null)
  const [winners, setWinners] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    // Get user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUser(user)

    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    setProfile(profile)

    // Get subscription
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    setSubscription(sub)

    // Get scores
    const { data: scores } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', user.id)
      .order('score_date', { ascending: false })
      .limit(5)
    setScores(scores || [])

    // Get charity
    if (profile?.charity_id) {
      const { data: charity } = await supabase
        .from('charities')
        .select('*')
        .eq('id', profile.charity_id)
        .single()
      setCharity(charity)
    }

    // Get winnings
    const { data: wins } = await supabase
      .from('winners')
      .select('*')
      .eq('user_id', user.id)
    setWinners(wins || [])

    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <main style={{
        background: '#0a0a0a',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <p>Loading dashboard...</p>
      </main>
    )
  }

  const totalWon = winners.reduce((sum, w) => sum + (w.amount || 0), 0)

  return (
    <main style={{
      background: '#0a0a0a',
      minHeight: '100vh',
      padding: '40px 20px',
      color: 'white',
      fontFamily: 'sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h1 style={{ color: '#22c55e', fontSize: '28px' }}>
            Welcome, {profile?.full_name || 'Player'} 👋
          </h1>
          <p style={{ color: '#aaa' }}>{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            background: '#f87171',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Logout
        </button>
      </div>

      {/* Cards Grid */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px'
      }}>

        {/* Subscription Card */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>📋 Subscription</h2>
          {subscription ? (
            <>
              <p style={cardValueStyle}>
                {subscription.status === 'active' ? '✅ Active' : '❌ Inactive'}
              </p>
              <p style={cardSubStyle}>
                Plan: {subscription.plan}
              </p>
              <p style={cardSubStyle}>
                Renews: {subscription.renewal_date}
              </p>
            </>
          ) : (
            <>
              <p style={{ color: '#f87171' }}>No active subscription</p>
              <a href="/subscribe" style={linkStyle}>
                Subscribe Now →
              </a>
            </>
          )}
        </div>

        {/* Scores Card */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>⛳ My Scores</h2>
          {scores.length === 0 ? (
            <p style={{ color: '#aaa' }}>No scores yet</p>
          ) : (
            scores.map(score => (
              <div key={score.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <span style={{ color: '#22c55e', fontWeight: 'bold' }}>
                  {score.score_value}
                </span>
                <span style={{ color: '#aaa', fontSize: '14px' }}>
                  {score.score_date}
                </span>
              </div>
            ))
          )}
          <a href="/scores" style={linkStyle}>
            Manage Scores →
          </a>
        </div>

        {/* Charity Card */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>❤️ My Charity</h2>
          {charity ? (
            <>
              <p style={cardValueStyle}>{charity.name}</p>
              <p style={cardSubStyle}>
                Contribution: {profile?.charity_percentage || 10}%
              </p>
            </>
          ) : (
            <p style={{ color: '#aaa' }}>No charity selected</p>
          )}
          <a href="/charities" style={linkStyle}>
            {charity ? 'Change Charity →' : 'Select Charity →'}
          </a>
        </div>

        {/* Winnings Card */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>🏆 My Winnings</h2>
          <p style={cardValueStyle}>
            ₹{totalWon.toLocaleString()}
          </p>
          <p style={cardSubStyle}>
            Total draws entered: {winners.length}
          </p>
          {winners.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              {winners.map(w => (
                <div key={w.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  fontSize: '14px'
                }}>
                  <span>Tier {w.tier} Match</span>
                  <span style={{
                    color: w.status === 'paid' ? '#22c55e' : '#facc15'
                  }}>
                    {w.status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Quick Links */}
      <div style={{
        marginTop: '40px',
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <a href="/scores" style={quickLinkStyle}>⛳ Enter Score</a>
        <a href="/charities" style={quickLinkStyle}>❤️ Charities</a>
        <a href="/subscribe" style={quickLinkStyle}>💳 Subscription</a>
      </div>

    </main>
  )
}

const cardStyle = {
  background: '#1a1a1a',
  border: '1px solid #333',
  borderRadius: '16px',
  padding: '24px',
  width: '260px',
  minHeight: '180px'
}

const cardTitleStyle = {
  fontSize: '18px',
  marginBottom: '16px',
  color: '#fff'
}

const cardValueStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#22c55e',
  marginBottom: '8px'
}

const cardSubStyle = {
  color: '#aaa',
  fontSize: '14px',
  marginBottom: '4px'
}

const linkStyle = {
  color: '#22c55e',
  display: 'block',
  marginTop: '12px',
  fontSize: '14px',
  textDecoration: 'none'
}

const quickLinkStyle = {
  padding: '12px 24px',
  background: '#1a1a1a',
  border: '1px solid #333',
  borderRadius: '8px',
  color: 'white',
  textDecoration: 'none',
  fontSize: '14px'
}