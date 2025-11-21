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
          opacity: 0.9,
          marginBottom: '20px'
        }}>
          We're working on something amazing. Check back soon!
        </p>
        <p style={{
          fontSize: '0.9rem',
          opacity: 0.7
        }}>
          Version 2.0.1 - Fresh Build - {new Date().toISOString().split('T')[0]}
        </p>
      </div>
    </div>
  )
}
