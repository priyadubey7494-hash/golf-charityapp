'use client'
import { useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function PaymentSuccess() {
  const router = useRouter()

  useEffect(() => {
    saveSubscription()
  }, [])

  const saveSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Save subscription to database
      await supabase.from('subscriptions').insert({
        user_id: user.id,
        plan: 'monthly',
        status: 'active',
        renewal_date: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString()
      })

      // Redirect to dashboard after 3 seconds
      setTimeout(() => router.push('/dashboard'), 3000)
    }
  }

  return (
    <main style={{
      background: '#0a0a0a',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'sans-serif',
      textAlign: 'center'
    }}>
      <div>
        <div style={{ fontSize: '80px' }}>✅</div>
        <h1 style={{ color: '#22c55e', fontSize: '36px', marginTop: '20px' }}>
          Payment Successful!
        </h1>
        <p style={{ color: '#aaa', marginTop: '12px' }}>
          Welcome to the platform. Redirecting to your dashboard...
        </p>
      </div>
    </main>
  )
}