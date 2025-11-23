import { useState, useEffect } from 'react'
import API_BASE_URL from '../../config'

interface User {
  id: number
  username: string
  email: string
  facility_id: number | null
  facility_type: string | null
  created_at: string
}

function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const adminToken = localStorage.getItem('admin')
      if (!adminToken) {
        setError('Nu sunteți autentificat')
        setLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        setUsers(data.data || [])
      } else {
        setError(data.error || 'Eroare la încărcarea utilizatorilor')
      }
    } catch (err: any) {
      console.error('Error loading users:', err)
      setError(err.message || 'Eroare la încărcarea utilizatorilor')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Se încarcă...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{
          padding: '1rem',
          background: '#fee2e2',
          color: '#dc2626',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
        <button
          onClick={loadUsers}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#0f172a',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Reîncearcă
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '0.5rem', color: '#0f172a' }}>
          Utilizatori
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
          Gestionează toți utilizatorii înregistrați în sistem
        </p>
      </div>

      {users.length === 0 ? (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>Nu există utilizatori înregistrați</p>
        </div>
      ) : (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#0f172a', fontSize: '0.875rem' }}>
                  ID
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#0f172a', fontSize: '0.875rem' }}>
                  Username
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#0f172a', fontSize: '0.875rem' }}>
                  Email
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#0f172a', fontSize: '0.875rem' }}>
                  Facilitate
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#0f172a', fontSize: '0.875rem' }}>
                  Tip
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#0f172a', fontSize: '0.875rem' }}>
                  Data înregistrării
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                    {user.id}
                  </td>
                  <td style={{ padding: '1rem', color: '#0f172a', fontSize: '0.875rem', fontWeight: '500' }}>
                    {user.username}
                  </td>
                  <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                    {user.email || '-'}
                  </td>
                  <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                    {user.facility_id ? `#${user.facility_id}` : '-'}
                  </td>
                  <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                    {user.facility_type ? (
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        background: '#f0fdf4',
                        color: '#059669'
                      }}>
                        {user.facility_type === 'field' ? 'Bază Sportivă' :
                         user.facility_type === 'coach' ? 'Antrenor' :
                         user.facility_type === 'repair_shop' ? 'Magazin Reparații' :
                         user.facility_type === 'equipment_shop' ? 'Magazin Articole' :
                         user.facility_type}
                      </span>
                    ) : '-'}
                  </td>
                  <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                    {new Date(user.created_at).toLocaleDateString('ro-RO', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Users

