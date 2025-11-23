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
      icon: '',
      category: 'sports-bases'
    },
    { 
      path: '/admin/approved-sports-bases', 
      label: 'Baze Sportive (Aprobate)', 
      icon: '',
      category: 'sports-bases'
    },
    { 
      path: '/admin/pending-coaches', 
      label: 'Antrenori (Pending)', 
      icon: '',
      category: 'coaches'
    },
    { 
      path: '/admin/approved-coaches', 
      label: 'Antrenori (Aprobați)', 
      icon: '',
      category: 'coaches'
    },
    { 
      path: '/admin/pending-repair-shops', 
      label: 'Magazine Reparații (Pending)', 
      icon: '',
      category: 'repair-shops'
    },
    { 
      path: '/admin/approved-repair-shops', 
      label: 'Magazine Reparații (Aprobate)', 
      icon: '',
      category: 'repair-shops'
    },
    { 
      path: '/admin/pending-equipment-shops', 
      label: 'Magazine Articole (Pending)', 
      icon: '',
      category: 'equipment-shops'
    },
    { 
      path: '/admin/approved-equipment-shops', 
      label: 'Magazine Articole (Aprobate)', 
      icon: '',
      category: 'equipment-shops'
    },
    { path: '/admin/suggestions', label: 'Sugestii', icon: '' },
    { 
      path: '/admin/seo-pages', 
      label: 'Pagini SEO', 
      icon: '',
      submenu: [
        { path: '/admin/seo-pages?category=field', label: 'SEO - Baze Sportive', icon: '' },
        { path: '/admin/seo-pages?category=coach', label: 'SEO - Antrenori', icon: '' },
        { path: '/admin/seo-pages?category=repair_shop', label: 'SEO - Magazine Reparații', icon: '' },
        { path: '/admin/seo-pages?category=equipment_shop', label: 'SEO - Magazine Articole', icon: '' },
        { path: '/admin/seo-pages', label: 'SEO - Toate', icon: '' }
      ]
    },
    { path: '/admin/users', label: 'Utilizatori', icon: '' },
    { path: '/admin/settings', label: 'Setări Site', icon: '' },
    { path: '/admin/smtp-config', label: 'Configurare SMTP', icon: '' }
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
      width: '280px',
      background: '#0f172a',
      color: 'white',
      minHeight: '100vh',
      padding: '0',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
      zIndex: 1000
    }}>
      <div style={{
        padding: '2rem 1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        marginBottom: '1rem'
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '1.5rem',
          fontWeight: '700',
          letterSpacing: '-0.02em',
          background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Admin Panel
        </h2>
        <p style={{
          margin: '0.5rem 0 0 0',
          fontSize: '0.75rem',
          color: 'rgba(255, 255, 255, 0.6)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontWeight: '500'
        }}>
          Panou de administrare
        </p>
      </div>

      <nav style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0.5rem 0',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent'
      }}>
        {menuItems.map(item => (
          <div key={item.path}>
            <Link
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.875rem 1.5rem',
                color: isActive(item.path) ? 'white' : 'rgba(255, 255, 255, 0.7)',
                textDecoration: 'none',
                background: isActive(item.path) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                borderLeft: isActive(item.path) ? '3px solid #10b981' : '3px solid transparent',
                transition: 'all 0.2s ease',
                fontWeight: isActive(item.path) ? '600' : '500',
                fontSize: '0.875rem',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
                }
              }}
            >
              {item.icon && <span style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>{item.icon}</span>}
              <span>{item.label}</span>
              {isActive(item.path) && (
                <div style={{
                  position: 'absolute',
                  right: '1rem',
                  width: '6px',
                  height: '6px',
                  background: '#10b981',
                  borderRadius: '50%',
                  boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)'
                }} />
              )}
            </Link>
            {item.submenu && (location.pathname === '/admin/seo-pages' || location.pathname.startsWith('/admin/seo-pages/')) && (
              <div style={{
                paddingLeft: '2rem',
                background: 'rgba(0, 0, 0, 0.2)',
                borderLeft: '2px solid rgba(255, 255, 255, 0.1)',
                marginLeft: '1.5rem'
              }}>
                {item.submenu.map(subItem => (
                  <Link
                    key={subItem.path}
                    to={subItem.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.625rem 1.5rem',
                      color: isSEOActive(subItem.path) ? 'white' : 'rgba(255, 255, 255, 0.6)',
                      textDecoration: 'none',
                      background: isSEOActive(subItem.path) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                      borderLeft: isSEOActive(subItem.path) ? '2px solid #10b981' : '2px solid transparent',
                      transition: 'all 0.2s ease',
                      fontWeight: isSEOActive(subItem.path) ? '600' : '400',
                      fontSize: '0.8125rem'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSEOActive(subItem.path)) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSEOActive(subItem.path)) {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'
                      }
                    }}
                  >
                    {subItem.icon && <span style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>{subItem.icon}</span>}
                    <span>{subItem.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div style={{
        padding: '1.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        marginTop: 'auto'
      }}>
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            padding: '0.875rem 1rem',
            background: 'rgba(239, 68, 68, 0.15)',
            color: 'white',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.875rem',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Deconectare
        </button>
      </div>
    </div>
  )
}

export default AdminSidebar

