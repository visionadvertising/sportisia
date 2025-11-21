import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import AddField from './pages/AddField'

function App() {
  return (
    <Router>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'Arial, sans-serif'
      }}>
        {/* Header */}
        <header style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '1rem 2rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Link to="/" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '8px'
              }}></div>
              <h1 style={{
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#333'
              }}>SPORTISIARO</h1>
            </Link>
            <nav style={{
              display: 'flex',
              gap: '2rem'
            }}>
              <Link to="/" style={{ textDecoration: 'none', color: '#333', fontWeight: '500' }}>Home</Link>
              <Link to="/tereni" style={{ textDecoration: 'none', color: '#333', fontWeight: '500' }}>Terenuri</Link>
              <Link to="/antrenori" style={{ textDecoration: 'none', color: '#333', fontWeight: '500' }}>Antrenori</Link>
            </nav>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/adauga-teren" element={<AddField />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
