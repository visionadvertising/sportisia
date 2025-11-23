import { useState, useEffect } from 'react'
import API_BASE_URL from '../../config'

interface Suggestion {
  id: number
  name: string
  county: string
  city: string
  address: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

function Suggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    loadSuggestions()
  }, [filterStatus])

  const loadSuggestions = async () => {
    try {
      setLoading(true)
      const adminToken = localStorage.getItem('admin')
      if (!adminToken) {
        setError('Nu sunteți autentificat')
        return
      }

      const url = filterStatus === 'all' 
        ? `${API_BASE_URL}/admin/suggestions`
        : `${API_BASE_URL}/admin/suggestions?status=${filterStatus}`

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })

      const data = await response.json()
      if (data.success) {
        setSuggestions(data.data || [])
      } else {
        setError(data.error || 'Eroare la încărcarea sugestiilor')
      }
    } catch (err: any) {
      setError(err.message || 'Eroare la încărcarea sugestiilor')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: number, status: 'approved' | 'rejected') => {
    try {
      const adminToken = localStorage.getItem('admin')
      if (!adminToken) {
        alert('Nu sunteți autentificat')
        return
      }

      const response = await fetch(`${API_BASE_URL}/admin/suggestions/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status })
      })

      const data = await response.json()
      if (data.success) {
        loadSuggestions()
      } else {
        alert(data.error || 'Eroare la actualizarea statusului')
      }
    } catch (err: any) {
      alert(err.message || 'Eroare la actualizarea statusului')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Sigur doriți să ștergeți această sugestie?')) {
      return
    }

    try {
      const adminToken = localStorage.getItem('admin')
      if (!adminToken) {
        alert('Nu sunteți autentificat')
        return
      }

      const response = await fetch(`${API_BASE_URL}/admin/suggestions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })

      const data = await response.json()
      if (data.success) {
        loadSuggestions()
      } else {
        alert(data.error || 'Eroare la ștergerea sugestiei')
      }
    } catch (err: any) {
      alert(err.message || 'Eroare la ștergerea sugestiei')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f59e0b'
      case 'approved':
        return '#10b981'
      case 'rejected':
        return '#ef4444'
      default:
        return '#64748b'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'În așteptare'
      case 'approved':
        return 'Aprobată'
      case 'rejected':
        return 'Respinsă'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Se încarcă...</p>
      </div>
    )
  }

  return (
      <div style={{ padding: '2rem', background: '#f9fafb', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <h1 style={{
              fontSize: isMobile ? '1.75rem' : '2rem',
              fontWeight: '700',
              color: '#0f172a',
              margin: 0
            }}>
              Sugestii facilități
            </h1>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}>
              {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: filterStatus === status ? '#6366f1' : 'white',
                    color: filterStatus === status ? 'white' : '#64748b',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (filterStatus !== status) {
                      e.currentTarget.style.borderColor = '#6366f1'
                      e.currentTarget.style.color = '#6366f1'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (filterStatus !== status) {
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.color = '#64748b'
                    }
                  }}
                >
                  {status === 'all' ? 'Toate' : getStatusLabel(status)}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{
              padding: '1rem',
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#991b1b',
              marginBottom: '1.5rem'
            }}>
              {error}
            </div>
          )}

          {suggestions.length === 0 ? (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '3rem',
              textAlign: 'center',
              color: '#64748b'
            }}>
              <p>Nu există sugestii {filterStatus !== 'all' ? `cu statusul "${getStatusLabel(filterStatus)}"` : ''}.</p>
            </div>
          ) : (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden'
            }}>
              <div style={{
                overflowX: 'auto'
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse'
                }}>
                  <thead>
                    <tr style={{
                      background: '#f8fafc',
                      borderBottom: '2px solid #e2e8f0'
                    }}>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>Denumire</th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>Județ</th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>Oraș</th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>Adresă</th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>Status</th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suggestions.map((suggestion) => (
                      <tr key={suggestion.id} style={{
                        borderBottom: '1px solid #f1f5f9'
                      }}>
                        <td style={{
                          padding: '1rem',
                          fontSize: '0.9375rem',
                          color: '#0f172a',
                          fontWeight: '500'
                        }}>{suggestion.name}</td>
                        <td style={{
                          padding: '1rem',
                          fontSize: '0.9375rem',
                          color: '#64748b'
                        }}>{suggestion.county}</td>
                        <td style={{
                          padding: '1rem',
                          fontSize: '0.9375rem',
                          color: '#64748b'
                        }}>{suggestion.city}</td>
                        <td style={{
                          padding: '1rem',
                          fontSize: '0.9375rem',
                          color: '#64748b',
                          maxWidth: '300px',
                          wordBreak: 'break-word'
                        }}>{suggestion.address}</td>
                        <td style={{
                          padding: '1rem'
                        }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '6px',
                            fontSize: '0.8125rem',
                            fontWeight: '600',
                            background: `${getStatusColor(suggestion.status)}20`,
                            color: getStatusColor(suggestion.status)
                          }}>
                            {getStatusLabel(suggestion.status)}
                          </span>
                        </td>
                        <td style={{
                          padding: '1rem'
                        }}>
                          <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            flexWrap: 'wrap'
                          }}>
                            {suggestion.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateStatus(suggestion.id, 'approved')}
                                  style={{
                                    padding: '0.375rem 0.75rem',
                                    background: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '0.8125rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#059669'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#10b981'
                                  }}
                                >
                                  Aprobă
                                </button>
                                <button
                                  onClick={() => updateStatus(suggestion.id, 'rejected')}
                                  style={{
                                    padding: '0.375rem 0.75rem',
                                    background: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '0.8125rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#dc2626'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#ef4444'
                                  }}
                                >
                                  Respinge
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDelete(suggestion.id)}
                              style={{
                                padding: '0.375rem 0.75rem',
                                background: 'transparent',
                                color: '#ef4444',
                                border: '1px solid #fecaca',
                                borderRadius: '6px',
                                fontSize: '0.8125rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#fee2e2'
                                e.currentTarget.style.borderColor = '#ef4444'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent'
                                e.currentTarget.style.borderColor = '#fecaca'
                              }}
                            >
                              Șterge
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default Suggestions

