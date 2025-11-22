import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './pages/Home'
import AddField from './pages/AddField'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import PendingFacilities from './pages/admin/PendingFacilities'
import ApprovedFacilities from './pages/admin/ApprovedFacilities'
import FacilityDetails from './pages/admin/FacilityDetails'
import FacilitiesList from './pages/FacilitiesList'
import AllFacilities from './pages/AllFacilities'

function AppContent() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
          padding: isMobile ? '0.75rem 1rem' : '1rem 2rem',
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
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: isMobile ? '0.75rem' : '0'
          }}>
            <Link to="/" style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '8px' : '10px',
              textDecoration: 'none',
              flexShrink: 0
            }}>
              <div style={{
                width: isMobile ? '28px' : '32px',
                height: isMobile ? '28px' : '32px',
                background: '#10b981',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: isMobile ? '1rem' : '1.2rem'
              }}>◆</div>
              <h1 style={{
                margin: 0,
                fontSize: isMobile ? '1.125rem' : '1.5rem',
                fontWeight: 'bold',
                color: '#333',
                letterSpacing: '0.5px'
              }}>SPORTISIA</h1>
            </Link>
            {isMobile ? (
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  background: 'transparent',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '40px',
                  minHeight: '40px'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2">
                  {menuOpen ? (
                    <path d="M18 6L6 18M6 6l12 12"/>
                  ) : (
                    <path d="M3 12h18M3 6h18M3 18h18"/>
                  )}
                </svg>
              </button>
            ) : (
              <nav style={{
                display: 'flex',
                gap: '1.5rem',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <Link to="/" style={{ textDecoration: 'none', color: '#333', fontWeight: '500', fontSize: '0.95rem' }}>Home</Link>
                <Link to="/terenuri" style={{ textDecoration: 'none', color: '#333', fontWeight: '500', fontSize: '0.95rem' }}>Terenuri</Link>
                <Link to="/antrenori" style={{ textDecoration: 'none', color: '#333', fontWeight: '500', fontSize: '0.95rem' }}>Antrenori</Link>
                <Link to="/magazine-reparatii" style={{ textDecoration: 'none', color: '#333', fontWeight: '500', fontSize: '0.95rem' }}>Magazine Reparații</Link>
                <Link to="/magazine-articole" style={{ textDecoration: 'none', color: '#333', fontWeight: '500', fontSize: '0.95rem' }}>Magazine Articole</Link>
                <div style={{ marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '1px solid #e0e0e0', display: 'flex', gap: '1rem' }}>
                  <Link to="/register" style={{ textDecoration: 'none', color: '#10b981', fontWeight: '600', fontSize: '0.95rem' }}>Înregistrare</Link>
                  <Link to="/login" style={{ textDecoration: 'none', color: '#1e3c72', fontWeight: '600', fontSize: '0.95rem' }}>Login</Link>
                </div>
              </nav>
            )}
          </div>
          {isMobile && menuOpen && (
            <nav style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid #f1f5f9',
              marginTop: '0.75rem'
            }}>
              <Link to="/" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: '#333', fontWeight: '500', fontSize: '0.95rem', padding: '0.75rem 0' }}>Home</Link>
              <Link to="/terenuri" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: '#333', fontWeight: '500', fontSize: '0.95rem', padding: '0.75rem 0' }}>Terenuri</Link>
              <Link to="/antrenori" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: '#333', fontWeight: '500', fontSize: '0.95rem', padding: '0.75rem 0' }}>Antrenori</Link>
              <Link to="/magazine-reparatii" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: '#333', fontWeight: '500', fontSize: '0.95rem', padding: '0.75rem 0' }}>Magazine Reparații</Link>
              <Link to="/magazine-articole" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: '#333', fontWeight: '500', fontSize: '0.95rem', padding: '0.75rem 0' }}>Magazine Articole</Link>
              <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link to="/register" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: '#10b981', fontWeight: '600', fontSize: '0.95rem', padding: '0.75rem 0' }}>Înregistrare</Link>
                <Link to="/login" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: '#1e3c72', fontWeight: '600', fontSize: '0.95rem', padding: '0.75rem 0' }}>Login</Link>
              </div>
            </nav>
          )}
        </header>
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/adauga-teren" element={<AddField />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/toate" element={<AllFacilities />} />
        {/* Generic route for all listings - handles all combinations */}
        <Route path="/:param1/:param2/:param3" element={<AllFacilities />} />
        <Route path="/:param1/:param2" element={<AllFacilities />} />
        <Route path="/:param1" element={<AllFacilities />} />
        {/* Simple routes (fallback) */}
        <Route path="/terenuri" element={<FacilitiesList type="field" title="Terenuri Sportive" />} />
        <Route path="/antrenori" element={<FacilitiesList type="coach" title="Antrenori" />} />
        <Route path="/magazine-reparatii" element={<FacilitiesList type="repair_shop" title="Magazine Reparații Articole Sportive" />} />
        <Route path="/magazine-articole" element={<FacilitiesList type="equipment_shop" title="Magazine Articole Sportive" />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/pending" element={<PendingFacilities />} />
        <Route path="/admin/approved" element={<ApprovedFacilities />} />
        <Route path="/admin/facilities/:id" element={<FacilityDetails />} />
        <Route path="/admin/users" element={<AdminDashboard />} />
        <Route path="/admin/settings" element={<AdminDashboard />} />
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
