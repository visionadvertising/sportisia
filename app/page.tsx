export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        color: 'white',
        padding: '40px'
      }}>
        <h1 style={{
          fontSize: '4rem',
          marginBottom: '20px',
          fontWeight: '700'
        }}>
          Under Construction
        </h1>
        <p style={{
          fontSize: '1.5rem',
          opacity: 0.9
        }}>
          We're working on something amazing. Check back soon!
        </p>
      </div>
    </div>
  )
}
