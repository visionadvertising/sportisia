import { useEffect, useState, type CSSProperties } from 'react'
import API_BASE_URL from '../../config'
import { slugify } from '../../utils/seo'

interface Category {
  id: number
  name: string
  slug: string
  parent_id?: number | null
  description?: string
  meta_title?: string
  meta_description?: string
  sort_order?: number
}

const empty = { name: '', slug: '', parentId: '', description: '', metaTitle: '', metaDescription: '', sortOrder: '0' }

function BlogCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState<number | null>(null)
  const [error, setError] = useState('')

  const load = async () => {
    const data = await fetch(`${API_BASE_URL}/admin/blog/categories`).then((r) => r.json())
    if (data.success) setCategories(data.data)
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    setError('')
    const payload = { ...form, slug: form.slug || slugify(form.name), parentId: form.parentId || null }
    const res = await fetch(editing ? `${API_BASE_URL}/admin/blog/categories/${editing}` : `${API_BASE_URL}/admin/blog/categories`, {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (!data.success) {
      setError(data.error || 'Nu am putut salva categoria.')
      return
    }
    setForm(empty)
    setEditing(null)
    load()
  }

  const edit = (category: Category) => {
    setEditing(category.id)
    setForm({
      name: category.name,
      slug: category.slug,
      parentId: category.parent_id ? String(category.parent_id) : '',
      description: category.description || '',
      metaTitle: category.meta_title || '',
      metaDescription: category.meta_description || '',
      sortOrder: String(category.sort_order || 0)
    })
  }

  const remove = async (id: number) => {
    if (!window.confirm('Ștergi categoria? Articolele rămân, fără categorie.')) return
    await fetch(`${API_BASE_URL}/admin/blog/categories/${id}`, { method: 'DELETE' })
    load()
  }

  const parents = categories.filter((c) => !c.parent_id)

  return (
    <div>
      <h1 style={{ marginTop: 0, color: '#0f172a' }}>Categorii</h1>
      {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 360px) 1fr', gap: '1rem', alignItems: 'start' }}>
        <div style={card}>
          <h2 style={{ marginTop: 0, fontSize: '1.05rem' }}>{editing ? 'Editează' : 'Categorie nouă'}</h2>
          <input placeholder="Nume" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : slugify(e.target.value) })} style={field} />
          <input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} style={field} />
          <select value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })} style={field}>
            <option value="">Categorie principală</option>
            {parents.filter((p) => p.id !== editing).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <textarea placeholder="Descriere" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={field} rows={3} />
          <input placeholder="Meta title" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} style={field} />
          <textarea placeholder="Meta description" value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} style={field} rows={2} />
          <input placeholder="Ordine" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} style={field} />
          <button type="button" onClick={save} style={{ background: '#059669', color: 'white', border: 'none', borderRadius: '10px', padding: '0.7rem 1rem', fontWeight: 700, cursor: 'pointer' }}>Salvează</button>
        </div>
        <div style={card}>
          {parents.map((parent) => (
            <div key={parent.id} style={{ marginBottom: '1rem' }}>
              <Row category={parent} onEdit={edit} onDelete={remove} />
              {categories.filter((c) => c.parent_id === parent.id).map((child) => (
                <div key={child.id} style={{ marginLeft: '1.25rem' }}>
                  <Row category={child} onEdit={edit} onDelete={remove} />
                </div>
              ))}
            </div>
          ))}
          {categories.length === 0 && <p style={{ color: '#64748b' }}>Nicio categorie încă.</p>}
        </div>
      </div>
    </div>
  )
}

function Row({ category, onEdit, onDelete }: { category: Category; onEdit: (c: Category) => void; onDelete: (id: number) => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', padding: '0.55rem 0', borderBottom: '1px solid #eef2f6' }}>
      <div>
        <strong>{category.name}</strong>
        <div style={{ color: '#64748b', fontSize: '0.82rem' }}>/blog/categorie/{category.slug}</div>
      </div>
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <button type="button" onClick={() => onEdit(category)} style={ghost}>Editează</button>
        <button type="button" onClick={() => onDelete(category.id)} style={{ ...ghost, color: '#b91c1c' }}>Șterge</button>
      </div>
    </div>
  )
}

const card: CSSProperties = { background: 'white', border: '1px solid #eef2f6', borderRadius: '16px', padding: '1rem' }
const field: CSSProperties = { width: '100%', boxSizing: 'border-box', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.65rem 0.8rem', marginBottom: '0.6rem', fontSize: '0.95rem' }
const ghost: CSSProperties = { background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.35rem 0.6rem', cursor: 'pointer' }

export default BlogCategories
