import { useState, useEffect } from 'react'
import API_BASE_URL from '../../config'

interface SiteSetting {
  id: number
  setting_key: string
  setting_value: string
  created_at: string
  updated_at: string
}

function SiteSettings() {
  const [settings, setSettings] = useState<SiteSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    setError('')
    try {
      const adminToken = localStorage.getItem('admin')
      if (!adminToken) {
        setError('Nu sunteți autentificat')
        setLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/admin/site-settings`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        // Backend returns settings as an object, convert to array
        const settingsArray = Object.entries(data.data || {}).map(([key, value], index) => ({
          id: index + 1,
          setting_key: key,
          setting_value: value as string,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
        setSettings(settingsArray)
      } else {
        setError(data.error || 'Eroare la încărcarea setărilor')
      }
    } catch (err: any) {
      console.error('Error loading settings:', err)
      setError(err.message || 'Eroare la încărcarea setărilor')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (setting: SiteSetting) => {
    setEditingKey(setting.setting_key)
    setEditValue(setting.setting_value)
  }

  const handleSave = async (key: string) => {
    try {
      const adminToken = localStorage.getItem('admin')
      if (!adminToken) {
        setError('Nu sunteți autentificat')
        return
      }

      const response = await fetch(`${API_BASE_URL}/admin/site-settings/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ setting_value: editValue })
      })

      const data = await response.json()
      if (data.success) {
        setSuccess('Setarea a fost actualizată cu succes')
        setTimeout(() => setSuccess(''), 3000)
        setEditingKey(null)
        loadSettings()
      } else {
        setError(data.error || 'Eroare la actualizarea setării')
        setTimeout(() => setError(''), 3000)
      }
    } catch (err: any) {
      console.error('Error updating setting:', err)
      setError('Eroare la conectarea la server')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleCancel = () => {
    setEditingKey(null)
    setEditValue('')
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Se încarcă...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '0.5rem', color: '#0f172a' }}>
          Setări Site
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
          Gestionează setările generale ale site-ului
        </p>
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          background: '#fee2e2',
          color: '#dc2626',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '1rem',
          background: '#d1fae5',
          color: '#059669',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          {success}
        </div>
      )}

      {settings.length === 0 ? (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>Nu există setări configurate</p>
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
                  Cheie
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#0f172a', fontSize: '0.875rem' }}>
                  Valoare
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#0f172a', fontSize: '0.875rem' }}>
                  Acțiuni
                </th>
              </tr>
            </thead>
            <tbody>
              {settings.map((setting) => (
                <tr key={setting.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem', color: '#0f172a', fontSize: '0.875rem', fontWeight: '500' }}>
                    {setting.setting_key}
                  </td>
                  <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                    {editingKey === setting.setting_key ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1.5px solid #e2e8f0',
                          borderRadius: '6px',
                          fontSize: '0.875rem'
                        }}
                      />
                    ) : (
                      <span>{setting.setting_value || '-'}</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {editingKey === setting.setting_key ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleSave(setting.setting_key)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}
                        >
                          Salvează
                        </button>
                        <button
                          onClick={handleCancel}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#f1f5f9',
                            color: '#64748b',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}
                        >
                          Anulează
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(setting)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#0f172a',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}
                      >
                        Editează
                      </button>
                    )}
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

export default SiteSettings

