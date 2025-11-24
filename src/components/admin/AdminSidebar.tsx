import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

interface AdminSidebarProps {
  onLogout: () => void
}

interface SubMenuItem {
  path: string
  label: string
  icon: string
}

interface MenuGroup {
  label: string
  icon: string
  submenu: SubMenuItem[]
}

function AdminSidebar({ onLogout }: AdminSidebarProps) {
  const location = useLocation()
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  // Auto-expand groups based on current route
  useEffect(() => {
    const currentPath = location.pathname
    const groups: string[] = []
    
    if (currentPath.includes('sports-bases') || currentPath.includes('facilities')) {
      groups.push('sports-bases')
    }
    if (currentPath.includes('coaches')) {
      groups.push('coaches')
    }
    if (currentPath.includes('repair-shops')) {
      groups.push('repair-shops')
    }
    if (currentPath.includes('equipment-shops')) {
      groups.push('equipment-shops')
    }
    if (currentPath.includes('seo-pages')) {
      groups.push('seo-pages')
    }
    
    setExpandedGroups(new Set(groups))
  }, [location.pathname])

  const menuGroups: MenuGroup[] = [
    {
      label: 'Baze Sportive',
      icon: '',
      submenu: [
        { path: '/admin/pending-sports-bases', label: 'Pending', icon: '' },
        { path: '/admin/approved-sports-bases', label: 'Aprobate', icon: '' },
        { path: '/admin/deleted-sports-bases', label: 'Șterse', icon: '' }
      ]
    },
    {
      label: 'Antrenori',
      icon: '',
      submenu: [
        { path: '/admin/pending-coaches', label: 'Pending', icon: '' },
        { path: '/admin/approved-coaches', label: 'Aprobați', icon: '' },
        { path: '/admin/deleted-coaches', label: 'Șterși', icon: '' }
      ]
    },
    {
      label: 'Magazine Reparații',
      icon: '',
      submenu: [
        { path: '/admin/pending-repair-shops', label: 'Pending', icon: '' },
        { path: '/admin/approved-repair-shops', label: 'Aprobate', icon: '' },
        { path: '/admin/deleted-repair-shops', label: 'Șterse', icon: '' }
      ]
    },
    {
      label: 'Magazine Articole',
      icon: '',
      submenu: [
        { path: '/admin/pending-equipment-shops', label: 'Pending', icon: '' },
        { path: '/admin/approved-equipment-shops', label: 'Aprobate', icon: '' },
        { path: '/admin/deleted-equipment-shops', label: 'Șterse', icon: '' }
      ]
    },
    {
      label: 'Pagini SEO',
      icon: '',
      submenu: [
        { path: '/admin/seo-pages?category=field', label: 'SEO - Baze Sportive', icon: '' },
        { path: '/admin/seo-pages?category=coach', label: 'SEO - Antrenori', icon: '' },
        { path: '/admin/seo-pages?category=repair_shop', label: 'SEO - Magazine Reparații', icon: '' },
        { path: '/admin/seo-pages?category=equipment_shop', label: 'SEO - Magazine Articole', icon: '' },
        { path: '/admin/seo-pages', label: 'SEO - Toate', icon: '' }
      ]
    }
  ]

  const singleMenuItems = [
    { path: '/admin/suggestions', label: 'Sugestii', icon: '' },
    { path: '/admin/users', label: 'Utilizatori', icon: '' },
    { path: '/admin/settings', label: 'Setări Site', icon: '' },
    { path: '/admin/smtp-config', label: 'Configurare SMTP', icon: '' }
  ]

  const toggleGroup = (groupLabel: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupLabel)) {
        newSet.delete(groupLabel)
      } else {
        newSet.add(groupLabel)
      }
      return newSet
    })
  }

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
  
  const isSubmenuActive = (path: string) => {
    if (path.includes('category=')) {
      if (location.pathname !== '/admin/seo-pages') return false
      const urlParams = new URLSearchParams(location.search)
      const category = urlParams.get('category') || ''
      const pathCategory = new URLSearchParams(path.split('?')[1]).get('category') || ''
      return category === pathCategory
    }
    return isActive(path)
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
        {/* Menu Groups with Submenus */}
        {menuGroups.map(group => {
          const isExpanded = expandedGroups.has(group.label)
          const hasActiveSubmenu = group.submenu.some(item => isSubmenuActive(item.path))
          
          return (
            <div key={group.label}>
              <div
                onClick={() => toggleGroup(group.label)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  padding: '0.875rem 1.5rem',
                  color: hasActiveSubmenu ? 'white' : 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  background: hasActiveSubmenu ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  borderLeft: hasActiveSubmenu ? '3px solid #10b981' : '3px solid transparent',
                  transition: 'all 0.2s ease',
                  fontWeight: hasActiveSubmenu ? '600' : '500',
                  fontSize: '0.875rem',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!hasActiveSubmenu) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!hasActiveSubmenu) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                  {group.icon && <span style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>{group.icon}</span>}
                  <span>{group.label}</span>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    flexShrink: 0
                  }}
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
              
              {isExpanded && (
                <div style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderLeft: '2px solid rgba(255, 255, 255, 0.1)',
                  marginLeft: '1.5rem'
                }}>
                  {group.submenu.map(subItem => {
                    const isSubActive = isSubmenuActive(subItem.path)
                    return (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.625rem 1.5rem 0.625rem 2rem',
                          color: isSubActive ? 'white' : 'rgba(255, 255, 255, 0.6)',
                          textDecoration: 'none',
                          background: isSubActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                          borderLeft: isSubActive ? '2px solid #10b981' : '2px solid transparent',
                          transition: 'all 0.2s ease',
                          fontWeight: isSubActive ? '600' : '400',
                          fontSize: '0.8125rem'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSubActive) {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSubActive) {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'
                          }
                        }}
                      >
                        {subItem.icon && <span style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>{subItem.icon}</span>}
                        <span>{subItem.label}</span>
                        {isSubActive && (
                          <div style={{
                            marginLeft: 'auto',
                            width: '6px',
                            height: '6px',
                            background: '#10b981',
                            borderRadius: '50%',
                            boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)'
                          }} />
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
        
        {/* Single Menu Items */}
        {singleMenuItems.map(item => (
          <Link
            key={item.path}
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

