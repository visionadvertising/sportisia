import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './pages/Home'
import Register from './pages/Register'
import RegisterTypeSelector from './pages/RegisterTypeSelector'
import RegisterSportsBase from './pages/register/RegisterSportsBase'
import RegisterRepairShop from './pages/register/RegisterRepairShop'
import RegisterEquipmentShop from './pages/register/RegisterEquipmentShop'
import RegisterCoach from './pages/register/RegisterCoach'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import PendingFacilities from './pages/admin/PendingFacilities'
import ApprovedFacilities from './pages/admin/ApprovedFacilities'
import PendingSportsBases from './pages/admin/PendingSportsBases'
import ApprovedSportsBases from './pages/admin/ApprovedSportsBases'
import PendingCoaches from './pages/admin/PendingCoaches'
import ApprovedCoaches from './pages/admin/ApprovedCoaches'
import PendingRepairShops from './pages/admin/PendingRepairShops'
import ApprovedRepairShops from './pages/admin/ApprovedRepairShops'
import PendingEquipmentShops from './pages/admin/PendingEquipmentShops'
import ApprovedEquipmentShops from './pages/admin/ApprovedEquipmentShops'
import FacilityDetails from './pages/admin/FacilityDetails'
import SEOPages from './pages/admin/SEOPages'
import SEOPageEdit from './pages/admin/SEOPageEdit'
import Suggestions from './pages/admin/Suggestions'
import Users from './pages/admin/Users'
import SiteSettings from './pages/admin/SiteSettings'
import SMTPConfig from './pages/admin/SMTPConfig'
import AdminLayout from './pages/admin/AdminLayout'
import FacilitiesList from './pages/FacilitiesList'
import AllFacilities from './pages/AllFacilities'
import SuggestFacility from './pages/SuggestFacility'
import SportsBasePublic from './pages/SportsBasePublic'

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
          background: '#ffffff',
          padding: isMobile ? '1.25rem 1rem' : '1.75rem 2rem',
          borderBottom: '1px solid #f1f5f9',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)'
        }}>
          <div style={{
            maxWidth: '1400px',
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
              flexShrink: 0,
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <h1 style={{
                margin: 0,
                fontSize: isMobile ? '1.375rem' : '1.875rem',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #0f172a 0%, #10b981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.03em'
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
                gap: isMobile ? '1rem' : '2.5rem',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <Link to="/" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500', fontSize: '0.9375rem', transition: 'all 0.2s', padding: '0.5rem 0', position: 'relative' }} 
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#0f172a'
                  }} 
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#64748b'
                  }}
                >Home</Link>
                <Link to="/terenuri" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500', fontSize: '0.9375rem', transition: 'all 0.2s', padding: '0.5rem 0' }} 
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#0f172a'
                  }} 
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#64748b'
                  }}
                >Terenuri</Link>
                <Link to="/antrenori" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500', fontSize: '0.9375rem', transition: 'all 0.2s', padding: '0.5rem 0' }} 
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#0f172a'
                  }} 
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#64748b'
                  }}
                >Antrenori</Link>
                <Link to="/magazine-reparatii" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500', fontSize: '0.9375rem', transition: 'all 0.2s', padding: '0.5rem 0' }} 
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#0f172a'
                  }} 
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#64748b'
                  }}
                >Magazine Reparații</Link>
                <Link to="/magazine-articole" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500', fontSize: '0.9375rem', transition: 'all 0.2s', padding: '0.5rem 0' }} 
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#0f172a'
                  }} 
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#64748b'
                  }}
                >Magazine Articole</Link>
                <div style={{ marginLeft: isMobile ? '0' : '1.5rem', paddingLeft: isMobile ? '0' : '1.5rem', borderLeft: isMobile ? 'none' : '1px solid #e2e8f0', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <Link to="/register" style={{ 
                    textDecoration: 'none', 
                    color: 'white', 
                    fontWeight: '600', 
                    fontSize: '0.9375rem', 
                    transition: 'all 0.2s', 
                    padding: '0.625rem 1.25rem', 
                    borderRadius: '8px',
                    background: '#10b981',
                    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
                  }} 
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#059669'
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.3)'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }} 
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#10b981'
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.2)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >Înregistrare</Link>
                  <Link to="/login" style={{ 
                    textDecoration: 'none', 
                    color: '#0f172a', 
                    fontWeight: '600', 
                    fontSize: '0.9375rem', 
                    transition: 'all 0.2s', 
                    padding: '0.625rem 1.25rem', 
                    borderRadius: '8px', 
                    background: 'white',
                    border: '1.5px solid #e2e8f0',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }} 
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f8fafc'
                      e.currentTarget.style.borderColor = '#10b981'
                      e.currentTarget.style.color = '#10b981'
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }} 
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'white'
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.color = '#0f172a'
                      e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
                    }}
                  >Login</Link>
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
              borderTop: '1px solid #e2e8f0',
              marginTop: '0.75rem'
            }}>
              <Link to="/" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500', fontSize: '0.9375rem', padding: '0.75rem 0', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#0f172a'} onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}>Home</Link>
              <Link to="/terenuri" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500', fontSize: '0.9375rem', padding: '0.75rem 0', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#0f172a'} onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}>Terenuri</Link>
              <Link to="/antrenori" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500', fontSize: '0.9375rem', padding: '0.75rem 0', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#0f172a'} onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}>Antrenori</Link>
              <Link to="/magazine-reparatii" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500', fontSize: '0.9375rem', padding: '0.75rem 0', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#0f172a'} onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}>Magazine Reparații</Link>
              <Link to="/magazine-articole" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500', fontSize: '0.9375rem', padding: '0.75rem 0', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#0f172a'} onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}>Magazine Articole</Link>
              <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link to="/register" onClick={() => setMenuOpen(false)} style={{ 
                  textDecoration: 'none', 
                  color: 'white', 
                  fontWeight: '600', 
                  fontSize: '0.9375rem', 
                  padding: '0.75rem 1.25rem', 
                  borderRadius: '8px',
                  background: '#10b981',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
                }} 
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#059669'
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.3)'
                  }} 
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#10b981'
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.2)'
                  }}
                >Înregistrare</Link>
                <Link to="/login" onClick={() => setMenuOpen(false)} style={{ 
                  textDecoration: 'none', 
                  color: '#0f172a', 
                  fontWeight: '600', 
                  fontSize: '0.9375rem', 
                  padding: '0.75rem 1.25rem', 
                  borderRadius: '8px',
                  background: 'white',
                  border: '1.5px solid #e2e8f0',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                }} 
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f8fafc'
                    e.currentTarget.style.borderColor = '#10b981'
                    e.currentTarget.style.color = '#10b981'
                  }} 
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white'
                    e.currentTarget.style.borderColor = '#e2e8f0'
                    e.currentTarget.style.color = '#0f172a'
                  }}
                >Login</Link>
              </div>
            </nav>
          )}
        </header>
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegisterTypeSelector />} />
        <Route path="/register/baze-sportive" element={<RegisterSportsBase />} />
        <Route path="/register/antrenori" element={<RegisterCoach />} />
        <Route path="/register/magazine-reparatii" element={<RegisterRepairShop />} />
        <Route path="/register/magazine-articole" element={<RegisterEquipmentShop />} />
        <Route path="/sugereaza" element={<SuggestFacility />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Specific routes - must be before generic routes */}
        <Route path="/baza-sportiva/:slug" element={<SportsBasePublic />} />
        <Route path="/terenuri" element={<FacilitiesList type="field" title="Terenuri Sportive" />} />
        <Route path="/antrenori" element={<FacilitiesList type="coach" title="Antrenori" />} />
        <Route path="/magazine-reparatii" element={<FacilitiesList type="repair_shop" title="Magazine Reparații Articole Sportive" />} />
        <Route path="/magazine-articole" element={<FacilitiesList type="equipment_shop" title="Magazine Articole Sportive" />} />
        <Route path="/toate" element={<AllFacilities />} />
        {/* Generic route for all listings - handles all combinations - MUST BE LAST */}
        <Route path="/:param1/:param2/:param3" element={<AllFacilities />} />
        <Route path="/:param1/:param2" element={<AllFacilities />} />
        <Route path="/:param1" element={<AllFacilities />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route index element={<PendingSportsBases />} /> {/* Default admin route */}
          {/* Baze Sportive */}
          <Route path="pending-sports-bases" element={<PendingSportsBases />} />
          <Route path="approved-sports-bases" element={<ApprovedSportsBases />} />
          {/* Antrenori */}
          <Route path="pending-coaches" element={<PendingCoaches />} />
          <Route path="approved-coaches" element={<ApprovedCoaches />} />
          {/* Magazine Reparații */}
          <Route path="pending-repair-shops" element={<PendingRepairShops />} />
          <Route path="approved-repair-shops" element={<ApprovedRepairShops />} />
          {/* Magazine Articole */}
          <Route path="pending-equipment-shops" element={<PendingEquipmentShops />} />
          <Route path="approved-equipment-shops" element={<ApprovedEquipmentShops />} />
          {/* Legacy routes - kept for backward compatibility */}
          <Route path="pending" element={<PendingFacilities />} />
          <Route path="approved" element={<ApprovedFacilities />} />
          {/* Common routes */}
          <Route path="facilities/:id" element={<FacilityDetails />} />
          <Route path="suggestions" element={<Suggestions />} />
          <Route path="seo-pages" element={<SEOPages />} />
          <Route path="seo-pages/edit" element={<SEOPageEdit />} />
          <Route path="seo-pages/:id" element={<SEOPageEdit />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<SiteSettings />} />
          <Route path="smtp-config" element={<SMTPConfig />} />
        </Route>
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
