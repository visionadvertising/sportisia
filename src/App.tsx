import { lazy, Suspense, useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Footer from './components/Footer'
import CookieNotice from './components/CookieNotice'
import HeaderSessionActions, { useHeaderSession } from './components/HeaderSessionActions'
import { AUTH_EVENT, isMemberSession } from './utils/memberSession'
import { refreshMemberSavedIds } from './utils/savedFacilities'

const RegisterTypeSelector = lazy(() => import('./pages/RegisterTypeSelector'))
const Login = lazy(() => import('./pages/Login'))
const AuthAccountChoice = lazy(() => import('./pages/AuthAccountChoice'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const PendingFacilities = lazy(() => import('./pages/admin/PendingFacilities'))
const ApprovedFacilities = lazy(() => import('./pages/admin/ApprovedFacilities'))
const PendingSportsBases = lazy(() => import('./pages/admin/PendingSportsBases'))
const ApprovedSportsBases = lazy(() => import('./pages/admin/ApprovedSportsBases'))
const PendingCoaches = lazy(() => import('./pages/admin/PendingCoaches'))
const ApprovedCoaches = lazy(() => import('./pages/admin/ApprovedCoaches'))
const PendingRepairShops = lazy(() => import('./pages/admin/PendingRepairShops'))
const ApprovedRepairShops = lazy(() => import('./pages/admin/ApprovedRepairShops'))
const PendingEquipmentShops = lazy(() => import('./pages/admin/PendingEquipmentShops'))
const ApprovedEquipmentShops = lazy(() => import('./pages/admin/ApprovedEquipmentShops'))
const FacilityDetails = lazy(() => import('./pages/admin/FacilityDetails'))
const SEOPages = lazy(() => import('./pages/admin/SEOPages'))
const SEOPageEdit = lazy(() => import('./pages/admin/SEOPageEdit'))
const Suggestions = lazy(() => import('./pages/admin/Suggestions'))
const Users = lazy(() => import('./pages/admin/Users'))
const SiteSettings = lazy(() => import('./pages/admin/SiteSettings'))
const SMTPConfig = lazy(() => import('./pages/admin/SMTPConfig'))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const FacilitiesList = lazy(() => import('./pages/FacilitiesList'))
const AllFacilities = lazy(() => import('./pages/AllFacilities'))
const SuggestFacility = lazy(() => import('./pages/SuggestFacility'))
const SportsBasePublic = lazy(() => import('./pages/SportsBasePublic'))
const ClaimFacility = lazy(() => import('./pages/ClaimFacility'))
const BlogList = lazy(() => import('./pages/BlogList'))
const BlogPost = lazy(() => import('./pages/BlogPost'))
const BlogPosts = lazy(() => import('./pages/admin/BlogPosts'))
const BlogPostEdit = lazy(() => import('./pages/admin/BlogPostEdit'))
const BlogCategories = lazy(() => import('./pages/admin/BlogCategories'))
const BlogComments = lazy(() => import('./pages/admin/BlogComments'))
const FacilityReviewsAdmin = lazy(() => import('./pages/admin/FacilityReviewsAdmin'))
const FacilityReportsAdmin = lazy(() => import('./pages/admin/FacilityReportsAdmin'))
const Contact = lazy(() => import('./pages/Contact'))
const SavedFacilities = lazy(() => import('./pages/SavedFacilities'))
const MemberAccount = lazy(() => import('./pages/MemberAccount'))
const RegisterMember = lazy(() => import('./pages/RegisterMember'))
const Terms = lazy(() => import('./pages/legal/Terms'))
const Privacy = lazy(() => import('./pages/legal/Privacy'))
const Cookies = lazy(() => import('./pages/legal/Cookies'))

function AppContent() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [menuOpen, setMenuOpen] = useState(false)
  const { loggedIn } = useHeaderSession()

  useEffect(() => {
    if (isMemberSession()) {
      refreshMemberSavedIds().catch(() => {})
    }
    const onAuth = () => {
      if (isMemberSession()) refreshMemberSavedIds().catch(() => {})
    }
    window.addEventListener(AUTH_EVENT, onAuth)
    return () => window.removeEventListener(AUTH_EVENT, onAuth)
  }, [])

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

  useEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    setMenuOpen(false)
  }, [location.pathname])

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
          zIndex: 1000,
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {loggedIn ? <HeaderSessionActions isMobile onNavigate={() => setMenuOpen(false)} /> : null}
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
              </div>
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
                <Link to="/recuperare-sportiva" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500', fontSize: '0.9375rem', transition: 'all 0.2s', padding: '0.5rem 0' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#0f172a'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#64748b'
                  }}
                >Recuperare sportivă</Link>
                <Link to="/blog" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500', fontSize: '0.9375rem', transition: 'all 0.2s', padding: '0.5rem 0' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#0f172a'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#64748b'
                  }}
                >Blog</Link>
                <HeaderSessionActions isMobile={false} />
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
              <Link to="/recuperare-sportiva" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500', fontSize: '0.9375rem', padding: '0.75rem 0', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#0f172a'} onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}>Recuperare sportivă</Link>
              <Link to="/blog" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500', fontSize: '0.9375rem', padding: '0.75rem 0', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#0f172a'} onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}>Blog</Link>
              {!loggedIn ? (
                <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <HeaderSessionActions isMobile onNavigate={() => setMenuOpen(false)} />
                </div>
              ) : null}
            </nav>
          )}
        </header>
      )}

      <Suspense fallback={<div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', color: '#64748b' }}>Se încarcă...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register/cont" element={<RegisterMember />} />
        <Route path="/register/facilitate" element={<RegisterTypeSelector />} />
        <Route path="/register" element={<AuthAccountChoice mode="register" />} />
        <Route path="/cont" element={<MemberAccount />} />
        <Route path="/register/baze-sportive" element={<ClaimFacility />} />
        <Route path="/register/antrenori" element={<ClaimFacility />} />
        <Route path="/register/magazine-reparatii" element={<ClaimFacility />} />
        <Route path="/register/magazine-articole" element={<ClaimFacility />} />
        <Route path="/register/recuperare-sportiva" element={<ClaimFacility />} />
        <Route path="/sugereaza" element={<SuggestFacility />} />
        <Route path="/login/membru" element={<Login accountKind="member" />} />
        <Route path="/login/facilitate" element={<Login accountKind="business" />} />
        <Route path="/login" element={<AuthAccountChoice mode="login" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route index element={<PendingSportsBases />} />
          <Route path="pending-sports-bases" element={<PendingSportsBases />} />
          <Route path="approved-sports-bases" element={<ApprovedSportsBases />} />
          <Route path="pending-coaches" element={<PendingCoaches />} />
          <Route path="approved-coaches" element={<ApprovedCoaches />} />
          <Route path="pending-repair-shops" element={<PendingRepairShops />} />
          <Route path="approved-repair-shops" element={<ApprovedRepairShops />} />
          <Route path="pending-equipment-shops" element={<PendingEquipmentShops />} />
          <Route path="approved-equipment-shops" element={<ApprovedEquipmentShops />} />
          <Route path="pending" element={<PendingFacilities />} />
          <Route path="approved" element={<ApprovedFacilities />} />
          <Route path="facilities/:id" element={<FacilityDetails />} />
          <Route path="suggestions" element={<Suggestions />} />
          <Route path="recenzii" element={<FacilityReviewsAdmin />} />
          <Route path="sesizari" element={<FacilityReportsAdmin />} />
          <Route path="seo-pages" element={<SEOPages />} />
          <Route path="seo-pages/edit" element={<SEOPageEdit />} />
          <Route path="seo-pages/:id" element={<SEOPageEdit />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<SiteSettings />} />
          <Route path="smtp-config" element={<SMTPConfig />} />
          <Route path="blog" element={<BlogPosts />} />
          <Route path="blog/nou" element={<BlogPostEdit />} />
          <Route path="blog/categorii" element={<BlogCategories />} />
          <Route path="blog/comentarii" element={<BlogComments />} />
          <Route path="blog/:id" element={<BlogPostEdit />} />
        </Route>
        {/* Specific routes - must be before generic routes */}
        <Route path="/revendica/:facilityId/plata/:claimId" element={<ClaimFacility />} />
        <Route path="/revendica/:facilityId/completare/:claimId" element={<ClaimFacility />} />
        <Route path="/revendica/:facilityId" element={<ClaimFacility />} />
        <Route path="/baza-sportiva/:slug" element={<SportsBasePublic />} />
        <Route path="/facility/:id/:name" element={<SportsBasePublic />} />
        <Route path="/facility/:slug" element={<SportsBasePublic />} />
        <Route path="/terenuri" element={<FacilitiesList type="field" title="Terenuri Sportive" />} />
        <Route path="/antrenori" element={<FacilitiesList type="coach" title="Antrenori" />} />
        <Route path="/magazine-reparatii" element={<FacilitiesList type="repair_shop" title="Magazine Reparații Articole Sportive" />} />
        <Route path="/magazine-articole" element={<FacilitiesList type="equipment_shop" title="Magazine Articole Sportive" />} />
        <Route path="/recuperare-sportiva" element={<FacilitiesList type="sports_recovery" title="Recuperare sportivă" />} />
        <Route path="/toate" element={<AllFacilities />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/salvate" element={<SavedFacilities />} />
        <Route path="/termeni-si-conditii" element={<Terms />} />
        <Route path="/politica-de-confidentialitate" element={<Privacy />} />
        <Route path="/politica-cookies" element={<Cookies />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/categorie/:slug" element={<BlogList />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        {/* Generic route for all listings - handles all combinations - MUST BE LAST */}
        <Route path="/:param1/:param2/:param3" element={<AllFacilities />} />
        <Route path="/:param1/:param2" element={<AllFacilities />} />
        <Route path="/:param1" element={<AllFacilities />} />
      </Routes>
      </Suspense>
      
      {/* Footer - doar pentru rute non-admin */}
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <CookieNotice />}
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
