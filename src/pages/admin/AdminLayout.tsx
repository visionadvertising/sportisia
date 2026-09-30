import { useEffect, useRef } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { colors } from '../../ui/theme'

function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // Check if admin is logged in
    const storedAdmin = localStorage.getItem('admin')
    const adminToken = localStorage.getItem('adminToken')
    if (!storedAdmin || !adminToken) {
      console.log('AdminLayout: No admin token, redirecting to login')
      navigate('/admin/login', { replace: true })
      return
    }
    console.log('AdminLayout: Admin token found, rendering content')
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('admin')
    localStorage.removeItem('adminToken')
    navigate('/admin/login')
  }

  // Redirect /admin to /admin/pending-sports-bases
  useEffect(() => {
    if (location.pathname === '/admin' || location.pathname === '/admin/') {
      navigate('/admin/pending-sports-bases', { replace: true })
    }
  }, [location.pathname, navigate])

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.page,
      display: 'flex',
      width: '100%'
    }}>
      <AdminSidebar onLogout={handleLogout} />
      <main
        ref={mainRef}
        style={{
        marginLeft: '280px',
        flex: 1,
        minHeight: '100vh',
        width: 'calc(100% - 280px)',
        overflow: 'auto',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ width: '100%', minHeight: '100%' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AdminLayout

