import { prisma } from '@/lib/prisma'

export default async function Home() {
  let fields = []
  let error = null

  try {
    fields = await prisma.sportsField.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    })
  } catch (err: any) {
    error = err.message
    console.error('Database error:', err)
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '40px 20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#0d9488', marginBottom: '10px' }}>
            Sportisiaro
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#6b7280' }}>
            Găsește terenuri sportive în România
          </p>
        </header>

        {error && (
          <div style={{
            padding: '20px',
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            marginBottom: '30px',
            color: '#991b1b'
          }}>
            <strong>Eroare:</strong> {error}
            <div style={{ marginTop: '10px', fontSize: '0.9rem' }}>
              Verifică că DATABASE_URL este setat corect în .env
            </div>
          </div>
        )}

        <main>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#111827' }}>
            Terenuri disponibile ({fields.length})
          </h2>

          {fields.length === 0 && !error && (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              background: '#f9fafb',
              borderRadius: '8px',
              color: '#6b7280'
            }}>
              <p style={{ fontSize: '1.1rem', marginBottom: '20px' }}>
                Nu există terenuri în baza de date.
              </p>
              <p style={{ fontSize: '0.9rem' }}>
                Accesează /api/setup pentru a adăuga terenuri de test.
              </p>
            </div>
          )}

          {fields.length > 0 && (
            <div style={{ display: 'grid', gap: '20px' }}>
              {fields.map((field) => (
                <div
                  key={field.id}
                  style={{
                    padding: '20px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    background: 'white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: '#111827' }}>
                    {field.name}
                  </h3>
                  <div style={{ color: '#6b7280', marginBottom: '10px' }}>
                    <strong>Tip:</strong> {field.type} | <strong>Oraș:</strong> {field.city}
                  </div>
                  <div style={{ color: '#6b7280', marginBottom: '10px' }}>
                    <strong>Locație:</strong> {field.location}
                  </div>
                  {field.description && (
                    <p style={{ color: '#4b5563', marginTop: '10px' }}>
                      {field.description}
                    </p>
                  )}
                  {field.pricePerHour && (
                    <div style={{ marginTop: '10px', color: '#0d9488', fontWeight: '600' }}>
                      {field.pricePerHour} RON/oră
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
