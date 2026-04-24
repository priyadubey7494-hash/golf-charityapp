export default function HomePage() {
  return (
    <main style={{
      fontFamily: 'sans-serif',
      background: '#0a0a0a',
      color: 'white',
      minHeight: '100vh'
    }}>
      {/* HERO SECTION */}
      <section style={{
        textAlign: 'center',
        padding: '80px 20px'
      }}>
        <h1 style={{ fontSize: '48px', color: '#22c55e' }}>
          Play Golf. Win Prizes. Change Lives.
        </h1>
        <p style={{ fontSize: '20px', color: '#aaa', marginTop: '20px' }}>
          Every score you enter supports a charity you believe in.
          Every month one lucky player wins big.
        </p>
        <a href="/signup" style={{
          display: 'inline-block',
          marginTop: '40px',
          padding: '16px 40px',
          background: '#22c55e',
          color: 'black',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '18px',
          textDecoration: 'none'
        }}>
          Subscribe Now
        </a>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '32px' }}>How It Works</h2>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '40px',
          marginTop: '40px',
          flexWrap: 'wrap'
        }}>
          {[
            { step: '1', text: 'Subscribe to the platform' },
            { step: '2', text: 'Enter your golf scores monthly' },
            { step: '3', text: 'Get entered into the monthly draw' },
            { step: '4', text: 'Win prizes and support charity' }
          ].map(item => (
            <div key={item.step} style={{
              background: '#1a1a1a',
              padding: '30px',
              borderRadius: '12px',
              width: '200px'
            }}>
              <div style={{
                fontSize: '36px',
                color: '#22c55e',
                fontWeight: 'bold'
              }}>
                {item.step}
              </div>
              <p style={{ marginTop: '10px', color: '#ccc' }}>{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}