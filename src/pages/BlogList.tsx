import { useEffect, useState, type CSSProperties } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import API_BASE_URL from '../config'
import { absoluteUrl, usePageSeo } from '../utils/blogSeo'

interface Category {
  id: number
  name: string
  slug: string
  parent_id?: number | null
  description?: string
  meta_title?: string
  meta_description?: string
}

interface PostCard {
  id: number
  title: string
  slug: string
  excerpt?: string
  cover_image?: string
  published_at?: string
  category_name?: string
  category_slug?: string
}

function BlogList() {
  const { slug } = useParams()
  const [params, setParams] = useSearchParams()
  const page = Math.max(1, parseInt(params.get('page') || '1', 10))
  const q = params.get('q') || ''
  const [query, setQuery] = useState(q)
  const [categories, setCategories] = useState<Category[]>([])
  const [posts, setPosts] = useState<PostCard[]>([])
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900)

  const current = categories.find((item) => item.slug === slug)
  const title = current?.meta_title || (current ? `${current.name} | Blog Sportisia` : 'Blog Sportisia')
  const description = current?.meta_description || current?.description || 'Articole, ghiduri și noutăți din sport, de la Sportisia.'

  usePageSeo({
    title,
    description,
    canonical: absoluteUrl(slug ? `/blog/categorie/${slug}` : '/blog')
  })

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    fetch(`${API_BASE_URL}/blog/categories`).then((r) => r.json()).then((data) => {
      if (data.success) setCategories(data.data)
    })
  }, [])

  useEffect(() => {
    setLoading(true)
    const search = new URLSearchParams({ page: String(page) })
    if (q) search.set('q', q)
    if (slug) search.set('category', slug)
    fetch(`${API_BASE_URL}/blog/posts?${search}`).then((r) => r.json()).then((data) => {
      setPosts(data.success ? data.data : [])
      setPages(data.pagination?.pages || 1)
      setLoading(false)
    })
  }, [page, q, slug])

  const parents = categories.filter((item) => !item.parent_id)

  const goPage = (next: number) => {
    const nextParams = new URLSearchParams(params)
    nextParams.set('page', String(next))
    setParams(nextParams)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      <div style={{ position: 'relative', overflow: 'hidden', textAlign: 'center', color: 'white', padding: isMobile ? '3rem 1rem 2rem' : '5rem 2rem 3rem' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '760px', margin: '0 auto' }}>
          <h1 style={{ margin: 0, fontSize: isMobile ? '2rem' : '3rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{current?.name || 'Blog'}</h1>
          <p style={{ margin: '1rem auto 0', color: 'rgba(255,255,255,0.78)', fontSize: isMobile ? '0.95rem' : '1.05rem', lineHeight: 1.6 }}>{description}</p>
        </div>
      </div>
      <div style={{ background: '#ffffff', padding: isMobile ? '2rem 1rem 3rem' : '3rem 2rem 4rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '260px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        <aside style={{ background: 'white', border: '1px solid #eef2f6', borderRadius: '16px', padding: '1rem' }}>
          <form onSubmit={(e) => { e.preventDefault(); const next = new URLSearchParams(params); if (query) next.set('q', query); else next.delete('q'); next.set('page', '1'); setParams(next) }} style={{ marginBottom: '1rem' }}>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Caută articole" style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.7rem 0.8rem' }} />
          </form>
          <Link to="/blog" style={catLink(!slug)}>Toate articolele</Link>
          {parents.map((parent) => (
            <div key={parent.id} style={{ marginTop: '0.35rem' }}>
              <Link to={`/blog/categorie/${parent.slug}`} style={catLink(slug === parent.slug)}>{parent.name}</Link>
              {categories.filter((item) => item.parent_id === parent.id).map((child) => (
                <Link key={child.id} to={`/blog/categorie/${child.slug}`} style={{ ...catLink(slug === child.slug), paddingLeft: '1.1rem', fontWeight: 500 }}>{child.name}</Link>
              ))}
            </div>
          ))}
        </aside>
        <div>
          {loading ? <p style={{ color: '#64748b' }}>Se încarcă...</p> : null}
          {!loading && posts.length === 0 ? <p style={{ color: '#64748b' }}>Nu am găsit articole.</p> : null}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
            {posts.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit', background: 'white', border: '1px solid #eef2f6', borderRadius: '16px', overflow: 'hidden' }}>
                {post.cover_image ? (
                  <img src={post.cover_image} alt="" style={{ width: '100%', height: '190px', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ height: '190px', background: 'linear-gradient(135deg, #ecfdf5, #f8fafc)' }} />
                )}
                <div style={{ padding: '1rem 1.05rem 1.15rem' }}>
                  <div style={{ color: '#059669', fontWeight: 700, fontSize: '0.8rem' }}>{post.category_name || 'Blog'}</div>
                  <h2 style={{ margin: '0.35rem 0', fontSize: '1.15rem', color: '#0f172a' }}>{post.title}</h2>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.92rem', lineHeight: 1.5 }}>{post.excerpt}</p>
                  {post.published_at && <div style={{ marginTop: '0.75rem', color: '#94a3b8', fontSize: '0.82rem' }}>{new Date(post.published_at).toLocaleDateString('ro-RO')}</div>}
                </div>
              </Link>
            ))}
          </div>
          {pages > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
              <button type="button" disabled={page <= 1} onClick={() => goPage(page - 1)} style={pageBtn}>Înapoi</button>
              <span style={{ alignSelf: 'center', color: '#64748b' }}>{page} / {pages}</span>
              <button type="button" disabled={page >= pages} onClick={() => goPage(page + 1)} style={pageBtn}>Înainte</button>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}

const catLink = (active: boolean): CSSProperties => ({
  display: 'block',
  textDecoration: 'none',
  color: active ? '#059669' : '#334155',
  fontWeight: active ? 700 : 600,
  padding: '0.4rem 0.2rem'
})

const pageBtn: CSSProperties = { border: '1px solid #e2e8f0', background: 'white', borderRadius: '8px', padding: '0.45rem 0.75rem', cursor: 'pointer' }

export default BlogList
