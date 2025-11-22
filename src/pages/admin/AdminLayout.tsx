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
      navigate('/admin/login')
      return
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('admin')
    navigate('/admin/login')
  }

  // Redirect /admin to /admin/pending
  useEffect(() => {
    if (location.pathname === '/admin') {
      navigate('/admin/pending', { replace: true })
    }
  }, [location.pathname, navigate])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f9fafb',
      display: 'flex'
    }}>
      <AdminSidebar onLogout={handleLogout} />
      <div style={{
        marginLeft: '250px',
        flex: 1,
        minHeight: '100vh'
      }}>
        {children}
      </div>
    </div>
  )
}

export default AdminLayout

