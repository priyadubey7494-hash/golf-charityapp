'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const [users, setUsers] = useState([])
  const [charities, setCharities] = useState([])
  const [draws, setDraws] = useState([])
  const [winners, setWinners] = useState([])
  const [activeTab, setActiveTab] = useState('users')
  const [loading, setLoading] = useState(true)
  const [newCharity, setNewCharity] = useState({ name: '', description: '' })
  const [drawMonth, setDrawMonth] = useState('')
  const [simulatedNumbers, setSimulatedNumbers] = useState([])
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    loadAllData()
  }

  const loadAllData = async () => {
    // Get all users
    const { data: users } = await supabase
      .from('profiles')
      .select('*')
    setUsers(users || [])

    // Get all charities
    const { data: charities } = await supabase
      .from('charities')
      .select('*')
    setCharities(charities || [])

    // Get all draws
    const { data: draws } = await supabase
      .from('draws')
      .select('*')
      .order('created_at', { ascending: false })
    setDraws(draws || [])

    // Get all winners
    const { data: winners } = await supabase
      .from('winners')
      .select('*')
    setWinners(winners || [])

    setLoading(false)
  }

  // DRAW SIMULATION
  const handleSimulateDraw = () => {
    const numbers = []
    while (numbers.length < 5) {
      const num = Math.floor(Math.random() * 45) + 1
      if (!numbers.includes(num)) numbers.push(num)
    }
    setSimulatedNumbers(numbers)
    setMessage('Simulation complete! Review numbers before publishing.')
  }

  // PUBLISH DRAW
  const handlePublishDraw = async () => {
    if (simulatedNumbers.length === 0) {
      setMessage('Please simulate draw first')
      return
    }

    if (!drawMonth) {
      setMessage('Please enter draw month')
      return
    }

    const { error } = await supabase
      .from('draws')
      .insert({
        month: drawMonth,
        draw_numbers: simulatedNumbers,
        status: 'published',
        logic_type: 'random'
      })

    if (error) {
      setMessage('Failed to publish draw')
      return
    }

    setMessage('Draw published successfully!')
    setSimulatedNumbers([])
    setDrawMonth('')
    loadAllData()
  }

  // ADD CHARITY
  const handleAddCharity = async () => {
    if (!newCharity.name || !newCharity.description) {
      setMessage('Please fill all charity fields')
      return
    }

    const { error } = await supabase
      .from('charities')
      .insert(newCharity)

    if (error) {
      setMessage('Failed to add charity')
      return
    }

    setMessage('Charity added successfully!')
    setNewCharity({ name: '', description: '' })
    loadAllData()
  }

  // DELETE CHARITY
  const handleDeleteCharity = async (id) => {
    await supabase.from('charities').delete().eq('id', id)
    loadAllData()
  }

  // VERIFY WINNER
  const handleVerifyWinner = async (id, status) => {
    await supabase
      .from('winners')
      .update({ status })
      .eq('id', id)
    loadAllData()
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
        <p>Loading admin panel...</p>
      </main>
    )
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
        Admin Dashboard
      </h1>
      <p style={{ color: '#aaa', marginBottom: '32px' }}>
        Manage users, draws, charities and winners
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

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '32px',
        flexWrap: 'wrap'
      }}>
        {['users', 'draws', 'charities', 'winners'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              background: activeTab === tab ? '#22c55e' : '#1a1a1a',
              color: activeTab === tab ? 'black' : 'white',
              border: '1px solid #333',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div>
          <h2 style={{ marginBottom: '16px' }}>
            All Users ({users.length})
          </h2>
          {users.map(user => (
            <div key={user.id} style={{
              background: '#1a1a1a',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <div>
                <p style={{ fontWeight: 'bold' }}>{user.full_name}</p>
                <p style={{ color: '#aaa', fontSize: '14px' }}>{user.email}</p>
              </div>
              <span style={{
                padding: '4px 12px',
                background: user.role === 'admin' ? '#22c55e' : '#333',
                color: user.role === 'admin' ? 'black' : 'white',
                borderRadius: '20px',
                fontSize: '12px',
                height: 'fit-content'
              }}>
                {user.role}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* DRAWS TAB */}
      {activeTab === 'draws' && (
        <div>
          <h2 style={{ marginBottom: '16px' }}>Draw Management</h2>

          {/* Draw Controls */}
          <div style={{
            background: '#1a1a1a',
            padding: '24px',
            borderRadius: '12px',
            marginBottom: '24px',
            maxWidth: '400px'
          }}>
            <h3 style={{ marginBottom: '16px', color: '#22c55e' }}>
              Create New Draw
            </h3>

            <input
              placeholder="Month (e.g. April 2026)"
              value={drawMonth}
              onChange={e => setDrawMonth(e.target.value)}
              style={inputStyle}
            />

            <button
              onClick={handleSimulateDraw}
              style={{
                ...buttonStyle,
                background: '#facc15',
                marginBottom: '12px'
              }}
            >
              🎲 Simulate Draw
            </button>

            {simulatedNumbers.length > 0 && (
              <div style={{
                marginBottom: '16px',
                padding: '16px',
                background: '#2a2a2a',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <p style={{ color: '#aaa', marginBottom: '8px' }}>
                  Simulated Numbers:
                </p>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  {simulatedNumbers.map((num, i) => (
                    <span key={i} style={{
                      background: '#22c55e',
                      color: 'black',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold'
                    }}>
                      {num}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handlePublishDraw}
              style={buttonStyle}
            >
              ✅ Publish Draw
            </button>
          </div>

          {/* Past Draws */}
          <h3 style={{ marginBottom: '16px' }}>Past Draws</h3>
          {draws.length === 0 ? (
            <p style={{ color: '#aaa' }}>No draws yet</p>
          ) : (
            draws.map(draw => (
              <div key={draw.id} style={{
                background: '#1a1a1a',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <p style={{ fontWeight: 'bold' }}>{draw.month}</p>
                  <span style={{
                    color: '#22c55e',
                    fontSize: '14px'
                  }}>
                    {draw.status}
                  </span>
                </div>
                <button
  onClick={async () => {
    const res = await fetch('/api/match-draw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drawId: draw.id })
    })
    const data = await res.json()
    setMessage(data.message || data.error)
    loadAllData()
  }}
  style={{
    marginTop: '12px',
    padding: '8px 16px',
    background: '#facc15',
    color: 'black',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px'
  }}
>
  🎯 Match Winners
</button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {draw.draw_numbers?.map((num, i) => (
                    <span key={i} style={{
                      background: '#22c55e',
                      color: 'black',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}>
                      {num}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* CHARITIES TAB */}
      {activeTab === 'charities' && (
        <div>
          <h2 style={{ marginBottom: '16px' }}>Charity Management</h2>

          {/* Add Charity */}
          <div style={{
            background: '#1a1a1a',
            padding: '24px',
            borderRadius: '12px',
            marginBottom: '24px',
            maxWidth: '400px'
          }}>
            <h3 style={{ marginBottom: '16px', color: '#22c55e' }}>
              Add New Charity
            </h3>
            <input
              placeholder="Charity Name"
              value={newCharity.name}
              onChange={e => setNewCharity({ ...newCharity, name: e.target.value })}
              style={inputStyle}
            />
            <input
              placeholder="Description"
              value={newCharity.description}
              onChange={e => setNewCharity({ ...newCharity, description: e.target.value })}
              style={inputStyle}
            />
            <button onClick={handleAddCharity} style={buttonStyle}>
              Add Charity
            </button>
          </div>

          {/* Charity List */}
          {charities.map(charity => (
            <div key={charity.id} style={{
              background: '#1a1a1a',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <div>
                <p style={{ fontWeight: 'bold' }}>{charity.name}</p>
                <p style={{ color: '#aaa', fontSize: '14px' }}>
                  {charity.description}
                </p>
              </div>
              <button
                onClick={() => handleDeleteCharity(charity.id)}
                style={{
                  padding: '8px 16px',
                  background: '#f87171',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* WINNERS TAB */}
      {activeTab === 'winners' && (
        <div>
          <h2 style={{ marginBottom: '16px' }}>
            Winners Management ({winners.length})
          </h2>
          {winners.length === 0 ? (
            <p style={{ color: '#aaa' }}>No winners yet</p>
          ) : (
            winners.map(winner => (
              <div key={winner.id} style={{
                background: '#1a1a1a',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <div>
                    <p style={{ fontWeight: 'bold' }}>
                      Tier {winner.tier} Match
                    </p>
                    <p style={{ color: '#aaa', fontSize: '14px' }}>
                      Amount: ₹{winner.amount}
                    </p>
                  </div>
                  <span style={{
                    color: winner.status === 'paid'
                      ? '#22c55e'
                      : winner.status === 'pending'
                      ? '#facc15'
                      : '#f87171'
                  }}>
                    {winner.status}
                  </span>
                </div>

                {winner.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleVerifyWinner(winner.id, 'paid')}
                      style={{
                        padding: '8px 16px',
                        background: '#22c55e',
                        color: 'black',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      ✅ Mark Paid
                    </button>
                    <button
                      onClick={() => handleVerifyWinner(winner.id, 'rejected')}
                      style={{
                        padding: '8px 16px',
                        background: '#f87171',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      ❌ Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
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