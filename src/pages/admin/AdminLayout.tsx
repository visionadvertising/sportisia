import { ReactNode, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar'

interface AdminLayoutProps {
  children: ReactNode
}

function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Check if admin is logged in
    const storedAdmin = localStorage.getItem('admin')
    if (!storedAdmin) {
      console.log('AdminLayout: No admin token, redirecting to login')
      navigate('/admin/login', { replace: true })
      return
    }
    console.log('AdminLayout: Admin token found, rendering content')
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('admin')
    navigate('/admin/login')
  }

  // Redirect /admin to /admin/pending-sports-bases
  useEffect(() => {
    if (location.pathname === '/admin' || location.pathname === '/admin/') {
      navigate('/admin/pending-sports-bases', { replace: true })
    }
  }, [location.pathname, navigate])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f9fafb',
      display: 'flex',
      width: '100%'
    }}>
      <AdminSidebar onLogout={handleLogout} />
      <main style={{
        marginLeft: '250px',
        flex: 1,
        minHeight: '100vh',
        width: 'calc(100% - 250px)',
        overflow: 'auto',
        position: 'relative',
        zIndex: 1
      }}>
        {children ? (
          <div style={{ width: '100%', minHeight: '100%' }}>
            {children}
          </div>
        ) : (
          <div style={{ padding: '2rem' }}>
            <p>Loading...</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminLayout

