'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function WinnerProofPage() {
  const [user, setUser] = useState(null)
  const [winners, setWinners] = useState([])
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    getUser()
  }, [])

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (user) fetchWinnings(user.id)
  }

  const fetchWinnings = async (userId) => {
    const { data } = await supabase
      .from('winners')
      .select('*')
      .eq('user_id', userId)
    setWinners(data || [])
  }

  const handleUploadProof = async (winnerId, file) => {
    if (!file) {
      setMessage('Please select a file')
      return
    }

    setUploading(true)
    setMessage('')

    try {
      // Upload file to Supabase storage
      const fileName = `proof_${winnerId}_${Date.now()}`
      const { data, error } = await supabase.storage
        .from('proofs')
        .upload(fileName, file)

      if (error) {
        setMessage('Upload failed. Try again.')
        setUploading(false)
        return
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('proofs')
        .getPublicUrl(fileName)

      // Update winner with proof URL
      await supabase
        .from('winners')
        .update({ proof_url: urlData.publicUrl })
        .eq('id', winnerId)

      setMessage('Proof uploaded successfully! Admin will verify soon.')
      fetchWinnings(user.id)

    } catch (error) {
      setMessage('Something went wrong. Try again.')
    }

    setUploading(false)
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
        Winner Verification
      </h1>
      <p style={{ color: '#aaa', marginBottom: '32px' }}>
        Upload proof of your golf scores to claim your prize
      </p>

      {message && (
        <p style={{
          marginBottom: '24px',
          padding: '12px',
          background: '#1a1a1a',
          borderRadius: '8px',
          color: message.includes('successfully') ? '#22c55e' : '#f87171'
        }}>
          {message}
        </p>
      )}

      {winners.length === 0 ? (
        <div style={{
          background: '#1a1a1a',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '48px' }}>🏆</p>
          <p style={{ color: '#aaa', marginTop: '16px' }}>
            You have no winnings yet. Keep playing!
          </p>
        </div>
      ) : (
        winners.map(winner => (
          <div key={winner.id} style={{
            background: '#1a1a1a',
            padding: '24px',
            borderRadius: '12px',
            marginBottom: '16px'
          }}>
            {/* Winner Info */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <div>
                <p style={{ fontWeight: 'bold', fontSize: '18px' }}>
                  Tier {winner.tier} Match 🎯
                </p>
                <p style={{ color: '#22c55e', fontSize: '24px', fontWeight: 'bold' }}>
                  ₹{winner.amount}
                </p>
              </div>
              <span style={{
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold',
                height: 'fit-content',
                background: winner.status === 'paid'
                  ? '#22c55e'
                  : winner.status === 'rejected'
                  ? '#f87171'
                  : '#facc15',
                color: winner.status === 'paid'
                  ? 'black'
                  : winner.status === 'rejected'
                  ? 'white'
                  : 'black'
              }}>
                {winner.status === 'paid' && '✅ Paid'}
                {winner.status === 'pending' && '⏳ Pending'}
                {winner.status === 'rejected' && '❌ Rejected'}
              </span>
            </div>

            {/* Proof Upload */}
            {winner.status === 'pending' && !winner.proof_url && (
              <div style={{
                background: '#2a2a2a',
                padding: '16px',
                borderRadius: '8px'
              }}>
                <p style={{ color: '#aaa', marginBottom: '12px', fontSize: '14px' }}>
                  Upload a screenshot of your scores from your golf platform
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleUploadProof(winner.id, e.target.files[0])}
                  style={{
                    color: 'white',
                    fontSize: '14px',
                    width: '100%'
                  }}
                />
                {uploading && (
                  <p style={{ color: '#facc15', marginTop: '8px' }}>
                    Uploading...
                  </p>
                )}
              </div>
            )}

            {/* Proof Already Uploaded */}
            {winner.proof_url && winner.status === 'pending' && (
              <div style={{
                background: '#2a2a2a',
                padding: '12px',
                borderRadius: '8px',
                color: '#22c55e',
                fontSize: '14px'
              }}>
                ✅ Proof uploaded. Waiting for admin review.
              </div>
            )}
          </div>
        ))
      )}

      <a href="/dashboard" style={{
        color: '#22c55e',
        marginTop: '24px',
        display: 'block'
      }}>
        ← Back to Dashboard
      </a>
    </main>
  )
}