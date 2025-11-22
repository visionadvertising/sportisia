import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import AddField from './pages/AddField'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'

function AppContent() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header - doar pentru rute non-admin */}
      {!isAdminRoute && (
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
                width: '32px',
                height: '32px',
                background: '#10b981',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.2rem'
              }}>◆</div>
              <h1 style={{
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#333',
                letterSpacing: '0.5px'
              }}>SPORTISIA</h1>
            </Link>
            <nav style={{
              display: 'flex',
              gap: '1.5rem',
              alignItems: 'center'
            }}>
              <Link to="/" style={{ textDecoration: 'none', color: '#333', fontWeight: '500', fontSize: '0.95rem' }}>Home</Link>
              <Link to="/sports" style={{ textDecoration: 'none', color: '#333', fontWeight: '500', fontSize: '0.95rem' }}>Sports</Link>
              <Link to="/coaches" style={{ textDecoration: 'none', color: '#333', fontWeight: '500', fontSize: '0.95rem' }}>Coaches</Link>
              <Link to="/courts" style={{ textDecoration: 'none', color: '#333', fontWeight: '500', fontSize: '0.95rem' }}>Courts & Fields</Link>
              <Link to="/mates" style={{ textDecoration: 'none', color: '#333', fontWeight: '500', fontSize: '0.95rem' }}>Find sport mates</Link>
              <Link to="/repair" style={{ textDecoration: 'none', color: '#333', fontWeight: '500', fontSize: '0.95rem' }}>Repair services</Link>
              <Link to="/for-coaches" style={{ textDecoration: 'none', color: '#333', fontWeight: '500', fontSize: '0.95rem' }}>For coaches</Link>
              <Link to="/for-clubs" style={{ textDecoration: 'none', color: '#333', fontWeight: '500', fontSize: '0.95rem' }}>For clubs</Link>
              <div style={{ marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '1px solid #e0e0e0', display: 'flex', gap: '1rem' }}>
                <Link to="/register" style={{ textDecoration: 'none', color: '#10b981', fontWeight: '600', fontSize: '0.95rem' }}>Înregistrare</Link>
                <Link to="/login" style={{ textDecoration: 'none', color: '#1e3c72', fontWeight: '600', fontSize: '0.95rem' }}>Login</Link>
              </div>
            </nav>
          </div>
        </header>
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/adauga-teren" element={<AddField />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
