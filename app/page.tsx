export default function Home() {
  return (
    <div style={{
      margin: 0,
      padding: 0,
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000000',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', margin: 0 }}>Under Construction</h1>
        <p style={{ fontSize: '1rem', marginTop: '20px', opacity: 0.8 }}>
          Version 4.0.1 - {new Date().toISOString()}
        </p>
      </div>
    </div>
  )
}
