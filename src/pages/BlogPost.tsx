import { FormEvent, useEffect, useState, type CSSProperties } from 'react'
import { Link, useParams } from 'react-router-dom'
import API_BASE_URL from '../config'
import { absoluteUrl, usePageSeo } from '../utils/blogSeo'
import { sanitizeHtml } from '../utils/sanitizeHtml'

interface Comment {
  id: number
  parent_id?: number | null
  author_name: string
  body: string
  rating?: number | null
  created_at: string
}

interface Related {
  id: number
  title: string
  slug: string
  excerpt?: string
  cover_image?: string
}

interface Post {
  title: string
  slug: string
  excerpt?: string
  content: string
  cover_image?: string
  published_at?: string
  author_name?: string
  tags?: string[]
  category_name?: string
  category_slug?: string
  meta_title?: string
  meta_description?: string
  canonical_url?: string
  og_image?: string
  robots?: string
  comments: Comment[]
  related: Related[]
}

function Stars({ value, onChange, size = 22 }: { value: number; onChange?: (next: number) => void; size?: number }) {
  const [hover, setHover] = useState(0)
  const active = hover || value
  return (
    <span style={{ display: 'inline-flex', gap: '2px' }} onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          aria-label={`${star} ${star === 1 ? 'stea' : 'stele'}`}
          onMouseEnter={() => onChange && setHover(star)}
          onClick={() => onChange?.(value === star ? 0 : star)}
          style={{ background: 'none', border: 'none', padding: 0, lineHeight: 1, cursor: onChange ? 'pointer' : 'default' }}
        >
          <svg width={size} height={size} viewBox="0 0 24 24" fill={star <= active ? '#f59e0b' : 'none'} stroke={star <= active ? '#f59e0b' : '#cbd5e1'} strokeWidth="1.6">
            <path d="M12 3.2l2.6 5.4 6 .9-4.3 4.2 1 5.9L12 16.8 6.7 19.6l1-5.9L3.4 9.5l6-.9L12 3.2z" />
          </svg>
        </button>
      ))}
    </span>
  )
}

function BlogPost() {
  const { slug } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [missing, setMissing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [notice, setNotice] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [email, setEmail] = useState('')
  const [body, setBody] = useState('')
  const [rating, setRating] = useState(0)
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [replyBody, setReplyBody] = useState('')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 800)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const load = () => {
    setMissing(false)
    fetch(`${API_BASE_URL}/blog/posts/${slug}`).then(async (res) => {
      const data = await res.json()
      if (!data.success) setMissing(true)
      else setPost(data.data)
    })
  }

  useEffect(() => {
    setPost(null)
    load()
  }, [slug])

  const shareUrl = absoluteUrl(`/blog/${slug || ''}`)
  usePageSeo({
    title: post ? (post.meta_title || `${post.title} | Blog Sportisia`) : 'Blog Sportisia',
    description: post?.meta_description || post?.excerpt || '',
    canonical: post?.canonical_url || shareUrl,
    robots: post?.robots,
    image: absoluteUrl(post?.og_image || post?.cover_image || ''),
    jsonLd: post ? {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      datePublished: post.published_at,
      author: { '@type': 'Person', name: post.author_name || 'Sportisia' },
      image: absoluteUrl(post.og_image || post.cover_image || '') || undefined,
      description: post.meta_description || post.excerpt
    } : null
  })

  const share = (kind: 'whatsapp' | 'facebook' | 'x') => {
    const text = encodeURIComponent(post?.title || 'Sportisia')
    const url = encodeURIComponent(shareUrl)
    const href = kind === 'whatsapp'
      ? `https://wa.me/?text=${text}%20${url}`
      : kind === 'facebook'
        ? `https://www.facebook.com/sharer/sharer.php?u=${url}`
        : `https://twitter.com/intent/tweet?url=${url}&text=${text}`
    window.open(href, '_blank', 'noopener,noreferrer')
  }

  const sendComment = async (event: FormEvent, parentId?: number) => {
    event.preventDefault()
    setNotice('')
    const res = await fetch(`${API_BASE_URL}/blog/posts/${slug}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        authorName,
        email,
        body: parentId ? replyBody : body,
        rating: parentId ? null : (rating || null),
        parentId: parentId || null
      })
    })
    const data = await res.json()
    setNotice(data.success ? data.message : (data.error || 'Nu am putut trimite comentariul.'))
    if (!data.success) return
    if (parentId) {
      setReplyBody('')
      setReplyTo(null)
    } else {
      setBody('')
      setRating(0)
    }
  }

  if (missing) {
    return <div style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 1rem' }}><h1>Articolul nu există</h1><Link to="/blog">Înapoi la blog</Link></div>
  }
  if (!post) return <div style={{ maxWidth: '800px', margin: '3rem auto', color: '#64748b', padding: '0 1rem' }}>Se încarcă...</div>

  const roots = post.comments.filter((comment) => !comment.parent_id)
  const repliesOf = (id: number) => post.comments.filter((comment) => comment.parent_id === id)
  const rated = post.comments.filter((comment) => !comment.parent_id && comment.rating)
  const average = rated.length ? rated.reduce((sum, comment) => sum + Number(comment.rating), 0) / rated.length : 0

  return (
    <article style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      <style>{`
        .blog-content h2, .blog-content h3 { color: #0f172a; line-height: 1.3; margin: 1.4rem 0 0.6rem; }
        .blog-content p { margin: 0 0 1rem; }
        .blog-content ul, .blog-content ol { margin: 0 0 1rem 1.25rem; }
        .blog-content a { color: #059669; }
        .blog-content blockquote { margin: 1rem 0; padding: 0.8rem 1rem; border-left: 3px solid #10b981; background: #f8fafc; color: #334155; }
      `}</style>
      <div style={{ position: 'relative', overflow: 'hidden', color: 'white', padding: isMobile ? '3rem 1rem 2.25rem' : '4.5rem 2rem 3rem' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto' }}>
          <Link to={post.category_slug ? `/blog/categorie/${post.category_slug}` : '/blog'} style={{ color: '#6ee7b7', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>{post.category_name || 'Blog'}</Link>
          <h1 style={{ margin: '0.7rem 0 0.85rem', fontSize: isMobile ? '2rem' : '3rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15 }}>{post.title}</h1>
          <div style={{ color: 'rgba(255,255,255,0.75)' }}>
            {post.author_name}{post.published_at ? ` · ${new Date(post.published_at).toLocaleDateString('ro-RO')}` : ''}
          </div>
        </div>
      </div>
      <div style={{ background: '#ffffff', padding: isMobile ? '2rem 1rem 3rem' : '3rem 2rem 4rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {post.cover_image && <img src={post.cover_image} alt="" style={{ width: '100%', maxHeight: '440px', objectFit: 'cover', borderRadius: '16px', marginBottom: '1.5rem', border: '1px solid #eef2f6' }} />}
          <div className="blog-content" style={{ color: '#1e293b', fontSize: '1.05rem', lineHeight: 1.75 }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content || '') }} />
          {post.tags && post.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
              {post.tags.map((tag) => <span key={tag} style={{ background: '#f8fafc', border: '1px solid #eef2f6', borderRadius: '999px', padding: '0.3rem 0.7rem', color: '#475569', fontSize: '0.85rem' }}>{tag}</span>)}
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
            <button type="button" onClick={() => share('whatsapp')} style={shareBtn}>WhatsApp</button>
            <button type="button" onClick={() => share('facebook')} style={shareBtn}>Facebook</button>
            <button type="button" onClick={() => share('x')} style={shareBtn}>X</button>
            <button type="button" onClick={() => { navigator.clipboard.writeText(shareUrl); setCopied(true) }} style={shareBtn}>{copied ? 'Link copiat' : 'Copiază link'}</button>
          </div>

          <section style={{ marginTop: '2.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <h2 style={{ color: '#0f172a', margin: 0 }}>Comentarii</h2>
              {average > 0 && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: '#64748b' }}>
                  <Stars value={Math.round(average)} />
                  <span>{average.toFixed(1)} · {rated.length}</span>
                </span>
              )}
            </div>
            {roots.length === 0 && <p style={{ color: '#64748b' }}>Fii primul care lasă un comentariu.</p>}
            {roots.map((comment) => (
              <div key={comment.id} style={{ background: 'white', border: '1px solid #eef2f6', borderRadius: '16px', padding: '1rem 1.05rem', marginTop: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center' }}>
                  <strong style={{ color: '#0f172a' }}>{comment.author_name}</strong>
                  <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{new Date(comment.created_at).toLocaleDateString('ro-RO')}</span>
                </div>
                {comment.rating ? <div style={{ marginTop: '0.35rem' }}><Stars value={Number(comment.rating)} size={16} /></div> : null}
                <p style={{ color: '#334155', lineHeight: 1.6 }}>{comment.body}</p>
                <button type="button" onClick={() => { setReplyTo(replyTo === comment.id ? null : comment.id); setReplyBody('') }} style={textBtn}>Răspunde</button>
                {repliesOf(comment.id).map((reply) => (
                  <div key={reply.id} style={{ marginTop: '0.8rem', marginLeft: isMobile ? '0.4rem' : '1.25rem', padding: '0.75rem 0.85rem', borderLeft: '3px solid #10b981', background: '#f8fafc', borderRadius: '0 12px 12px 0' }}>
                    <strong style={{ color: '#0f172a' }}>{reply.author_name}</strong>
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}> · {new Date(reply.created_at).toLocaleDateString('ro-RO')}</span>
                    <p style={{ margin: '0.35rem 0 0', color: '#334155' }}>{reply.body}</p>
                  </div>
                ))}
                {replyTo === comment.id && (
                  <form onSubmit={(event) => sendComment(event, comment.id)} style={{ marginTop: '0.9rem', padding: '0.9rem', background: '#f8fafc', borderRadius: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.75rem' }}>
                      <label style={label}>Nume<input required value={authorName} onChange={(e) => setAuthorName(e.target.value)} style={field} /></label>
                      <label style={label}>Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={field} /></label>
                    </div>
                    <label style={{ ...label, marginTop: '0.75rem' }}>Răspuns<textarea required minLength={5} placeholder={`Răspuns pentru ${comment.author_name}`} value={replyBody} onChange={(e) => setReplyBody(e.target.value)} rows={3} style={{ ...field, resize: 'vertical' }} /></label>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                      <button type="submit" style={primaryBtn}>Trimite răspunsul</button>
                    </div>
                  </form>
                )}
              </div>
            ))}
            <form onSubmit={(event) => sendComment(event)} style={{ background: 'white', border: '1px solid #eef2f6', borderRadius: '16px', padding: isMobile ? '1rem' : '1.35rem', marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#0f172a' }}>Lasă un comentariu</h3>
                  <p style={{ margin: '0.3rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>Apare pe pagină după ce este aprobat.</p>
                </div>
                <div>
                  <div style={label}>Nota ta, opțional</div>
                  <Stars value={rating} onChange={setRating} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.85rem' }}>
                <label style={label}>Nume<input required value={authorName} onChange={(e) => setAuthorName(e.target.value)} style={field} /></label>
                <label style={label}>Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={field} /></label>
              </div>
              <label style={{ ...label, marginTop: '0.85rem' }}>Mesaj<textarea required minLength={5} value={body} onChange={(e) => setBody(e.target.value)} rows={5} style={{ ...field, resize: 'vertical' }} /></label>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.9rem' }}>
                {notice ? <p style={{ margin: 0, color: notice.includes('așteaptă') || notice.includes('asteapta') ? '#047857' : '#b91c1c' }}>{notice}</p> : <span />}
                <button type="submit" style={primaryBtn}>Trimite comentariul</button>
              </div>
            </form>
          </section>
        </div>
        {post.related.length > 0 && (
          <section style={{ maxWidth: '1400px', margin: '2.5rem auto 0' }}>
            <h2 style={{ color: '#0f172a' }}>Din aceeași categorie</h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))', gap: '1rem' }}>
              {post.related.map((item) => (
                <Link key={item.id} to={`/blog/${item.slug}`} style={{ textDecoration: 'none', color: 'inherit', background: 'white', border: '1px solid #eef2f6', borderRadius: '16px', overflow: 'hidden' }}>
                  {item.cover_image ? <img src={item.cover_image} alt="" style={{ width: '100%', height: '140px', objectFit: 'cover' }} /> : <div style={{ height: '140px', background: '#f8fafc' }} />}
                  <div style={{ padding: '0.9rem' }}>
                    <strong>{item.title}</strong>
                    <p style={{ color: '#64748b', marginBottom: 0 }}>{item.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  )
}

const label: CSSProperties = { display: 'block', color: '#334155', fontWeight: 700, fontSize: '0.85rem' }
const field: CSSProperties = { display: 'block', width: '100%', boxSizing: 'border-box', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem 0.85rem', marginTop: '0.35rem', fontSize: '0.95rem', fontFamily: 'inherit', background: 'white' }
const shareBtn: CSSProperties = { background: 'white', border: '1px solid #eef2f6', borderRadius: '999px', padding: '0.45rem 0.8rem', cursor: 'pointer', fontWeight: 700, color: '#0f172a' }
const primaryBtn: CSSProperties = { background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', padding: '0.75rem 1rem', fontWeight: 700, cursor: 'pointer' }
const textBtn: CSSProperties = { background: 'none', border: 'none', color: '#059669', fontWeight: 700, cursor: 'pointer', padding: 0 }

export default BlogPost
