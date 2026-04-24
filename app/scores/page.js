'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function ScoresPage() {
  const [scores, setScores] = useState([])
  const [scoreValue, setScoreValue] = useState('')
  const [scoreDate, setScoreDate] = useState('')
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    getUser()
  }, [])

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (user) fetchScores(user.id)
  }

  const fetchScores = async (userId) => {
    const { data } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', userId)
      .order('score_date', { ascending: false })
      .limit(5)
    setScores(data || [])
  }

  const handleAddScore = async () => {
    setMessage('')

    // Validation
    if (!scoreValue || !scoreDate) {
      setMessage('Please enter both score and date')
      return
    }

    const val = parseInt(scoreValue)
    if (val < 1 || val > 45) {
      setMessage('Score must be between 1 and 45')
      return
    }

    // Check if score already exists for this date
    const { data: existing } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', user.id)
      .eq('score_date', scoreDate)

    if (existing && existing.length > 0) {
      setMessage('You already have a score for this date. Please edit or delete it.')
      return
    }

    // If already 5 scores, delete the oldest one
    if (scores.length >= 5) {
      const oldest = scores[scores.length - 1]
      await supabase
        .from('scores')
        .delete()
        .eq('id', oldest.id)
    }

    // Add new score
    const { error } = await supabase
      .from('scores')
      .insert({
        user_id: user.id,
        score_value: val,
        score_date: scoreDate
      })

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('Score added successfully!')
    setScoreValue('')
    setScoreDate('')
    fetchScores(user.id)
  }

  const handleDelete = async (id) => {
    await supabase.from('scores').delete().eq('id', id)
    fetchScores(user.id)
  }

  return (
    <main style={{
      background: '#0a0a0a',
      minHeight: '100vh',
      padding: '40px 20px',
      color: 'white',
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ color: '#22c55e', fontSize: '32px', marginBottom: '8px' }}>
        My Golf Scores
      </h1>
      <p style={{ color: '#aaa', marginBottom: '32px' }}>
        Enter your Stableford scores (1-45). Only latest 5 are kept.
      </p>

      {/* Score Entry Form */}
      <div style={{
        background: '#1a1a1a',
        padding: '24px',
        borderRadius: '12px',
        marginBottom: '32px',
        maxWidth: '400px'
      }}>
        <h2 style={{ marginBottom: '16px' }}>Add New Score</h2>

        <input
          type="number"
          placeholder="Score (1-45)"
          value={scoreValue}
          onChange={e => setScoreValue(e.target.value)}
          min="1"
          max="45"
          style={inputStyle}
        />

        <input
          type="date"
          value={scoreDate}
          onChange={e => setScoreDate(e.target.value)}
          style={inputStyle}
        />

        <button onClick={handleAddScore} style={buttonStyle}>
          Add Score
        </button>

        {message && (
          <p style={{
            marginTop: '12px',
            color: message.includes('successfully') ? '#22c55e' : '#f87171'
          }}>
            {message}
          </p>
        )}
      </div>

      {/* Scores List */}
      <div style={{ maxWidth: '400px' }}>
        <h2 style={{ marginBottom: '16px' }}>
          My Last 5 Scores
        </h2>

        {scores.length === 0 ? (
          <p style={{ color: '#aaa' }}>No scores yet. Add your first score above.</p>
        ) : (
          scores.map((score, index) => (
            <div key={score.id} style={{
              background: '#1a1a1a',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{
                  color: '#22c55e',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}>
                  {score.score_value}
                </span>
                <span style={{ color: '#aaa', marginLeft: '12px', fontSize: '14px' }}>
                  {score.score_date}
                </span>
                {index === 0 && (
                  <span style={{
                    marginLeft: '8px',
                    background: '#22c55e',
                    color: 'black',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    Latest
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDelete(score.id)}
                style={{
                  background: '#f87171',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      <a href="/dashboard" style={{ color: '#22c55e', marginTop: '24px', display: 'block' }}>
        ← Back to Dashboard
      </a>
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