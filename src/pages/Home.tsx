import { Link } from 'react-router-dom'

function Home() {
  return (
    <>
      {/* Sub Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '2rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginBottom: '0.5rem'
        }}>o Comunitate Sportivă Mondială</h2>
        <p style={{
          margin: 0,
          fontSize: '1.2rem',
          opacity: 0.9
        }}>Găsește ce ai nevoie în câteva secunde</p>
      </div>

      {/* Search Bar */}
      <div style={{
        maxWidth: '1200px',
        margin: '2rem auto',
        padding: '0 2rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'flex-end'
        }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: '500',
              fontSize: '0.9rem'
            }}>LOCAȚIE</label>
            <input
              type="text"
              placeholder="Location"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: '500',
              fontSize: '0.9rem'
            }}>SPORT</label>
            <select
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                background: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="">Sport</option>
              <option value="tenis">Tenis</option>
              <option value="fotbal">Fotbal</option>
              <option value="baschet">Baschet</option>
              <option value="volei">Volei</option>
            </select>
          </div>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: '500',
              fontSize: '0.9rem'
            }}>CATEGORIE</label>
            <select
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                background: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="">Service type</option>
              <option value="teren">Teren</option>
              <option value="antrenor">Antrenor</option>
              <option value="echipa">Echipă</option>
            </select>
          </div>
          <button
            style={{
              padding: '0.75rem 2rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            🔍 Caută
          </button>
        </div>
      </div>

      {/* Popular Selections */}
      <div style={{
        maxWidth: '1200px',
        margin: '2rem auto',
        padding: '0 2rem',
        flex: 1
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{
            color: 'white',
            fontSize: '1.8rem',
            margin: 0
          }}>Cele mai populare selecții</h3>
          <Link
            to="/adauga-teren"
            style={{
              padding: '0.75rem 2rem',
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            + Adaugă Teren
          </Link>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {[
            { title: 'Terenuri de Tenis', count: 45, icon: '🎾' },
            { title: 'Terenuri de Fotbal', count: 32, icon: '⚽' },
            { title: 'Terenuri de Baschet', count: 28, icon: '🏀' },
            { title: 'Terenuri de Volei', count: 18, icon: '🏐' },
            { title: 'Antrenori de Tenis', count: 15, icon: '👨‍🏫' },
            { title: 'Antrenori de Fotbal', count: 12, icon: '👨‍🏫' }
          ].map((item, index) => (
            <div
              key={index}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem'
              }}>{item.icon}</div>
              <h4 style={{
                margin: 0,
                fontSize: '1.2rem',
                color: '#333',
                marginBottom: '0.5rem'
              }}>{item.title}</h4>
              <p style={{
                margin: 0,
                color: '#667eea',
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}>{item.count} disponibile</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        background: 'rgba(0, 0, 0, 0.3)',
        padding: '2rem',
        marginTop: '3rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <p style={{
          margin: 0,
          opacity: 0.8
        }}>©2024 Sportisiaro. Toate drepturile rezervate.</p>
      </footer>
    </>
  )
}

export default Home

