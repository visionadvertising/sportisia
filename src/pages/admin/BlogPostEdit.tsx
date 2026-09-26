import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import API_BASE_URL from '../../config'
import { slugify } from '../../utils/seo'

interface Category {
  id: number
  name: string
  parent_id?: number | null
}

function BlogPostEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id
  const [categories, setCategories] = useState<Category[]>([])
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [categoryId, setCategoryId] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [tags, setTags] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [publishedAt, setPublishedAt] = useState('')
  const [authorName, setAuthorName] = useState('Admin')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [canonicalUrl, setCanonicalUrl] = useState('')
  const [ogImage, setOgImage] = useState('')
  const [robots, setRobots] = useState('index,follow')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const admin = localStorage.getItem('admin')
    if (admin) {
      try {
        const parsed = JSON.parse(admin)
        if (parsed.username) setAuthorName(parsed.username)
      } catch { /* ignore */ }
    }
    fetch(`${API_BASE_URL}/admin/blog/categories`).then((r) => r.json()).then((data) => {
      if (data.success) setCategories(data.data)
    })
    if (!id) return
    fetch(`${API_BASE_URL}/admin/blog/posts/${id}`).then((r) => r.json()).then((data) => {
      if (!data.success) {
        setError(data.error || 'Articolul nu există.')
        return
      }
      const post = data.data
      setTitle(post.title || '')
      setSlug(post.slug || '')
      setSlugTouched(true)
      setCategoryId(post.category_id ? String(post.category_id) : '')
      setExcerpt(post.excerpt || '')
      setContent(post.content || '')
      setCoverImage(post.cover_image || '')
      setTags(Array.isArray(post.tags) ? post.tags.join(', ') : '')
      setStatus(post.status || 'draft')
      setPublishedAt(post.published_at ? String(post.published_at).slice(0, 16) : '')
      setAuthorName(post.author_name || 'Admin')
      setMetaTitle(post.meta_title || '')
      setMetaDescription(post.meta_description || '')
      setCanonicalUrl(post.canonical_url || '')
      setOgImage(post.og_image || '')
      setRobots(post.robots || 'index,follow')
    })
  }, [id])

  const modules = useMemo(() => ({
    toolbar: [[{ header: [2, 3, false] }], ['bold', 'italic', 'underline'], [{ list: 'ordered' }, { list: 'bullet' }], ['link', 'blockquote'], ['clean']]
  }), [])

  const upload = async (file: File, target: 'cover' | 'og') => {
    const form = new FormData()
    form.append('image', file)
    const res = await fetch(`${API_BASE_URL}/admin/blog/upload`, { method: 'POST', body: form })
    const data = await res.json()
    if (!data.success) {
      setError(data.error || 'Upload eșuat.')
      return
    }
    if (target === 'cover') setCoverImage(data.data.url)
    else setOgImage(data.data.url)
  }

  const save = async () => {
    setSaving(true)
    setError('')
    const payload = {
      title,
      slug: slug || slugify(title),
      categoryId: categoryId || null,
      excerpt,
      content,
      coverImage,
      tags: tags.split(',').map((item) => item.trim()).filter(Boolean),
      status,
      publishedAt: publishedAt ? publishedAt.replace('T', ' ') : null,
      authorName,
      metaTitle,
      metaDescription,
      canonicalUrl,
      ogImage,
      robots
    }
    const res = await fetch(isNew ? `${API_BASE_URL}/admin/blog/posts` : `${API_BASE_URL}/admin/blog/posts/${id}`, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    setSaving(false)
    if (!data.success) {
      setError(data.error || 'Nu am putut salva articolul.')
      return
    }
    navigate('/admin/blog')
  }

  return (
    <div style={{ maxWidth: '920px' }}>
      <h1 style={{ marginTop: 0, color: '#0f172a' }}>{isNew ? 'Articol nou' : 'Editează articolul'}</h1>
      {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
      <div style={card}>
        <label style={label}>Titlu</label>
        <input value={title} onChange={(e) => { setTitle(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)) }} style={field} />
        <label style={label}>Slug</label>
        <input value={slug} onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)) }} style={field} />
        <label style={label}>Categorie</label>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={field}>
          <option value="">Fără categorie</option>
          {categories.filter((c) => !c.parent_id).map((parent) => (
            <optgroup key={parent.id} label={parent.name}>
              <option value={parent.id}>{parent.name}</option>
              {categories.filter((c) => c.parent_id === parent.id).map((child) => (
                <option key={child.id} value={child.id}>— {child.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
        <label style={label}>Extras</label>
        <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} style={field} />
        <label style={label}>Conținut</label>
        <ReactQuill theme="snow" value={content} onChange={setContent} modules={modules} />
        <label style={{ ...label, marginTop: '1rem' }}>Copertă</label>
        {coverImage && <img src={coverImage} alt="" style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: '12px', marginBottom: '0.5rem' }} />}
        <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], 'cover')} />
        <label style={label}>Tag-uri, separate prin virgulă</label>
        <input value={tags} onChange={(e) => setTags(e.target.value)} style={field} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label style={label}>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as 'draft' | 'published')} style={field}>
              <option value="draft">Ciornă</option>
              <option value="published">Publicat</option>
            </select>
          </div>
          <div>
            <label style={label}>Data publicării</label>
            <input type="datetime-local" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} style={field} />
          </div>
        </div>
      </div>
      <div style={{ ...card, marginTop: '1rem' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>SEO</h2>
        <label style={label}>Meta title</label>
        <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} style={field} />
        <label style={label}>Meta description</label>
        <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={3} style={field} />
        <label style={label}>Canonical</label>
        <input value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} style={field} placeholder="https://sportisia.ro/blog/slug" />
        <label style={label}>Imagine Open Graph</label>
        {ogImage && <img src={ogImage} alt="" style={{ width: '180px', height: '100px', objectFit: 'cover', borderRadius: '8px', display: 'block', marginBottom: '0.5rem' }} />}
        <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], 'og')} />
        <label style={label}>Robots</label>
        <select value={robots} onChange={(e) => setRobots(e.target.value)} style={field}>
          <option value="index,follow">index, follow</option>
          <option value="noindex,follow">noindex, follow</option>
        </select>
      </div>
      <button type="button" disabled={saving} onClick={save} style={{ marginTop: '1rem', background: '#059669', color: 'white', border: 'none', borderRadius: '10px', padding: '0.8rem 1.2rem', fontWeight: 700, cursor: 'pointer' }}>
        {saving ? 'Se salvează...' : 'Salvează'}
      </button>
    </div>
  )
}

const card: CSSProperties = { background: 'white', border: '1px solid #eef2f6', borderRadius: '16px', padding: '1.1rem' }
const label: CSSProperties = { display: 'block', fontWeight: 700, color: '#334155', margin: '0.85rem 0 0.35rem', fontSize: '0.9rem' }
const field: CSSProperties = { width: '100%', boxSizing: 'border-box', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.7rem 0.85rem', fontSize: '0.95rem' }

export default BlogPostEdit
