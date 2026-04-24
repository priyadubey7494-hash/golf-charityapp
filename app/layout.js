export const metadata = {
  title: 'Golf Charity App',
  description: 'Play Golf. Win Prizes. Change Lives.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        padding: 0,
        background: '#0a0a0a',
        color: 'white',
        fontFamily: 'sans-serif'
      }}>
        {children}
      </body>
    </html>
  )
}