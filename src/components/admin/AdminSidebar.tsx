import { Link, useLocation } from 'react-router-dom'

interface AdminSidebarProps {
  onLogout: () => void
}

function AdminSidebar({ onLogout }: AdminSidebarProps) {
  const location = useLocation()

  const menuItems = [
    { path: '/admin/pending', label: 'Cereri în așteptare', icon: '⏳' },
    { path: '/admin/approved', label: 'Facilități aprobate', icon: '✅' },
    { path: '/admin/suggestions', label: 'Sugestii', icon: '💡' },
    { path: '/admin/seo-pages', label: 'Pagini SEO', icon: '🔍' },
    { path: '/admin/users', label: 'Utilizatori', icon: '👥' },
    { path: '/admin/settings', label: 'Setări Site', icon: '⚙️' }
  ]

  const isActive = (path: string) => {
    if (path === '/admin/pending' || path === '/admin/approved') {
      return location.pathname === path || location.pathname.startsWith('/admin/facilities/')
    }
    if (path === '/admin/seo-pages') {
      return location.pathname === path || location.pathname.startsWith('/admin/seo-pages/')
    }
    if (path === '/admin/suggestions') {
      return location.pathname === path
    }
    return location.pathname === path
  }

  return (
    <div style={{
      width: '250px',
      background: '#1e3c72',
      color: 'white',
      minHeight: '100vh',
      padding: '2rem 0',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
          Admin Panel
        </h2>
      </div>

      <nav style={{ flex: 1 }}>
        {menuItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 1.5rem',
              color: 'white',
              textDecoration: 'none',
              background: isActive(item.path) ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              borderLeft: isActive(item.path) ? '4px solid white' : '4px solid transparent',
              transition: 'all 0.2s',
              fontWeight: isActive(item.path) ? 'bold' : 'normal'
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div style={{ padding: '0 1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: '1rem' }}>
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: 'rgba(239, 68, 68, 0.2)',
            color: 'white',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.9rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
          }}
        >
          Deconectare
        </button>
      </div>
    </div>
  )
}

export default AdminSidebar

