'use client'

export default function Home() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      margin: 0,
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000000',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      zIndex: 9999
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', margin: 0, fontWeight: 'bold' }}>
          UNDER CONSTRUCTION
        </h1>
        <p style={{ fontSize: '1.2rem', marginTop: '30px', opacity: 0.7 }}>
          Version 5.0.0 - Clean Build
        </p>
        <p style={{ fontSize: '0.9rem', marginTop: '10px', opacity: 0.5 }}>
          {typeof window !== 'undefined' ? new Date().toISOString() : ''}
        </p>
      </div>
    </div>
  )
}
