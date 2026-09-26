import { useEffect, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import API_BASE_URL from '../../config'

interface BlogPostRow {
  id: number
  title: string
  slug: string
  status: 'draft' | 'published'
  published_at?: string
  updated_at?: string
  category_name?: string
}

function BlogPosts() {
  const [posts, setPosts] = useState<BlogPostRow[]>([])
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const load = async () => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (status) params.set('status', status)
    const res = await fetch(`${API_BASE_URL}/admin/blog/posts?${params}`)
    const data = await res.json()
    if (!data.success) setError(data.error || 'Nu am putut încărca articolele.')
    else setPosts(data.data)
  }

  useEffect(() => {
    load()
  }, [status])

  const setPostStatus = async (id: number, next: 'draft' | 'published') => {
    const current = await fetch(`${API_BASE_URL}/admin/blog/posts/${id}`).then((r) => r.json())
    if (!current.success) return
    const post = current.data
    await fetch(`${API_BASE_URL}/admin/blog/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        coverImage: post.cover_image,
        categoryId: post.category_id,
        status: next,
        publishedAt: next === 'published' ? (post.published_at || new Date().toISOString()) : post.published_at,
        authorName: post.author_name,
        tags: post.tags,
        metaTitle: post.meta_title,
        metaDescription: post.meta_description,
        canonicalUrl: post.canonical_url,
        ogImage: post.og_image,
        robots: post.robots
      })
    })
    load()
  }

  const remove = async (id: number) => {
    if (!window.confirm('Ștergi acest articol?')) return
    await fetch(`${API_BASE_URL}/admin/blog/posts/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', color: '#0f172a' }}>Articole</h1>
          <p style={{ margin: '0.35rem 0 0', color: '#64748b' }}>Ciorne și articole publicate pe blog.</p>
        </div>
        <Link to="/admin/blog/nou" style={{ background: '#059669', color: 'white', textDecoration: 'none', padding: '0.7rem 1rem', borderRadius: '10px', fontWeight: 700 }}>Articol nou</Link>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} placeholder="Caută după titlu" style={inputStyle} />
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
          <option value="">Toate</option>
          <option value="published">Publicate</option>
          <option value="draft">Ciorne</option>
        </select>
        <button type="button" onClick={load} style={buttonStyle}>Caută</button>
      </div>
      {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
      <div style={{ background: 'white', border: '1px solid #eef2f6', borderRadius: '16px', overflow: 'hidden' }}>
        {posts.length === 0 ? (
          <p style={{ padding: '1.5rem', color: '#64748b' }}>Niciun articol.</p>
        ) : posts.map((post) => (
          <div key={post.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '1rem 1.1rem', borderBottom: '1px solid #eef2f6', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <strong style={{ color: '#0f172a' }}>{post.title}</strong>
              <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                {post.category_name || 'Fără categorie'} · {post.status === 'published' ? 'Publicat' : 'Ciornă'} · /blog/{post.slug}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Link to={`/admin/blog/${post.id}`} style={ghostStyle}>Editează</Link>
              {post.status === 'published' ? (
                <button type="button" onClick={() => setPostStatus(post.id, 'draft')} style={ghostStyle}>Ciornă</button>
              ) : (
                <button type="button" onClick={() => setPostStatus(post.id, 'published')} style={ghostStyle}>Publică</button>
              )}
              <button type="button" onClick={() => remove(post.id)} style={{ ...ghostStyle, color: '#b91c1c' }}>Șterge</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const inputStyle: CSSProperties = { border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.7rem 0.85rem', fontSize: '0.95rem', background: 'white' }
const buttonStyle: CSSProperties = { background: '#0f172a', color: 'white', border: 'none', borderRadius: '10px', padding: '0.7rem 1rem', fontWeight: 700, cursor: 'pointer' }
const ghostStyle: CSSProperties = { background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.45rem 0.7rem', cursor: 'pointer', textDecoration: 'none', color: '#0f172a', fontWeight: 600 }

export default BlogPosts
