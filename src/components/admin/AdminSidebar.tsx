import { Link, useLocation } from 'react-router-dom'

interface AdminSidebarProps {
  onLogout: () => void
}

interface MenuItem {
  path: string
  label: string
  icon: string
  category?: string
  submenu?: Array<{ path: string; label: string; icon: string }>
}

function AdminSidebar({ onLogout }: AdminSidebarProps) {
  const location = useLocation()

  const menuItems: MenuItem[] = [
    { 
      path: '/admin/pending-sports-bases', 
      label: 'Baze Sportive (Pending)', 
      icon: '🏟️',
      category: 'sports-bases'
    },
    { 
      path: '/admin/approved-sports-bases', 
      label: 'Baze Sportive (Aprobate)', 
      icon: '✅',
      category: 'sports-bases'
    },
    { 
      path: '/admin/pending-coaches', 
      label: 'Antrenori (Pending)', 
      icon: '👨‍🏫',
      category: 'coaches'
    },
    { 
      path: '/admin/approved-coaches', 
      label: 'Antrenori (Aprobați)', 
      icon: '✅',
      category: 'coaches'
    },
    { 
      path: '/admin/pending-repair-shops', 
      label: 'Magazine Reparații (Pending)', 
      icon: '🔧',
      category: 'repair-shops'
    },
    { 
      path: '/admin/approved-repair-shops', 
      label: 'Magazine Reparații (Aprobate)', 
      icon: '✅',
      category: 'repair-shops'
    },
    { 
      path: '/admin/pending-equipment-shops', 
      label: 'Magazine Articole (Pending)', 
      icon: '🛍️',
      category: 'equipment-shops'
    },
    { 
      path: '/admin/approved-equipment-shops', 
      label: 'Magazine Articole (Aprobate)', 
      icon: '✅',
      category: 'equipment-shops'
    },
    { path: '/admin/suggestions', label: 'Sugestii', icon: '💡' },
    { 
      path: '/admin/seo-pages', 
      label: 'Pagini SEO', 
      icon: '🔍',
      submenu: [
        { path: '/admin/seo-pages?category=field', label: 'SEO - Baze Sportive', icon: '🏟️' },
        { path: '/admin/seo-pages?category=coach', label: 'SEO - Antrenori', icon: '👨‍🏫' },
        { path: '/admin/seo-pages?category=repair_shop', label: 'SEO - Magazine Reparații', icon: '🔧' },
        { path: '/admin/seo-pages?category=equipment_shop', label: 'SEO - Magazine Articole', icon: '🛍️' },
        { path: '/admin/seo-pages', label: 'SEO - Toate', icon: '📄' }
      ]
    },
    { path: '/admin/users', label: 'Utilizatori', icon: '👥' },
    { path: '/admin/settings', label: 'Setări Site', icon: '⚙️' }
  ]

  const isActive = (path: string) => {
    if (path.includes('sports-bases') || path.includes('coaches') || path.includes('repair-shops') || path.includes('equipment-shops')) {
      return location.pathname === path || location.pathname.startsWith('/admin/facilities/')
    }
    if (path === '/admin/seo-pages' || path.startsWith('/admin/seo-pages?')) {
      return location.pathname === '/admin/seo-pages' || location.pathname.startsWith('/admin/seo-pages/')
    }
    if (path === '/admin/suggestions') {
      return location.pathname === path
    }
    return location.pathname === path
  }
  
  const isSEOActive = (path: string) => {
    if (location.pathname !== '/admin/seo-pages') return false
    const urlParams = new URLSearchParams(location.search)
    const category = urlParams.get('category') || ''
    
    if (path === '/admin/seo-pages' && !category) return true
    if (path.includes('category=')) {
      const pathCategory = new URLSearchParams(path.split('?')[1]).get('category') || ''
      return category === pathCategory
    }
    return false
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

      <nav style={{ flex: 1, overflowY: 'auto' }}>
        {menuItems.map(item => (
          <div key={item.path}>
            <Link
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
            {item.submenu && (location.pathname === '/admin/seo-pages' || location.pathname.startsWith('/admin/seo-pages/')) && (
              <div style={{ paddingLeft: '1.5rem', background: 'rgba(0, 0, 0, 0.1)' }}>
                {item.submenu.map(subItem => (
                  <Link
                    key={subItem.path}
                    to={subItem.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1.5rem',
                      color: 'white',
                      textDecoration: 'none',
                      background: isSEOActive(subItem.path) ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                      borderLeft: isSEOActive(subItem.path) ? '3px solid white' : '3px solid transparent',
                      transition: 'all 0.2s',
                      fontWeight: isSEOActive(subItem.path) ? '600' : 'normal',
                      fontSize: '0.9rem'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSEOActive(subItem.path)) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSEOActive(subItem.path)) {
                        e.currentTarget.style.background = 'transparent'
                      }
                    }}
                  >
                    <span style={{ fontSize: '1rem' }}>{subItem.icon}</span>
                    <span>{subItem.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
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

