import { useEffect, useState, type CSSProperties } from 'react'
import API_BASE_URL from '../../config'

interface Comment {
  id: number
  author_name: string
  email: string
  body: string
  rating?: number | null
  parent_id?: number | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  post_title: string
}

function BlogComments() {
  const [comments, setComments] = useState<Comment[]>([])
  const [status, setStatus] = useState('pending')

  const load = async (next = status) => {
    const data = await fetch(`${API_BASE_URL}/admin/blog/comments?status=${next}`).then((r) => r.json())
    if (data.success) setComments(data.data)
  }

  useEffect(() => { load(status) }, [status])

  const update = async (id: number, next: string) => {
    await fetch(`${API_BASE_URL}/admin/blog/comments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next })
    })
    load()
  }

  return (
    <div>
      <h1 style={{ marginTop: 0, color: '#0f172a' }}>Comentarii</h1>
      <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ marginBottom: '1rem', padding: '0.65rem 0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <option value="">Toate</option>
        <option value="pending">În așteptare</option>
        <option value="approved">Aprobate</option>
        <option value="rejected">Respinse</option>
      </select>
      <div style={{ background: 'white', border: '1px solid #eef2f6', borderRadius: '16px' }}>
        {comments.length === 0 && <p style={{ padding: '1.2rem', color: '#64748b' }}>Niciun comentariu.</p>}
        {comments.map((comment) => (
          <div key={comment.id} style={{ padding: '1rem 1.1rem', borderBottom: '1px solid #eef2f6' }}>
            <strong>{comment.author_name}</strong>
            <span style={{ color: '#64748b' }}> · {comment.email} · {comment.post_title}</span>
            {comment.parent_id ? <span style={{ color: '#0369a1' }}> · Răspuns</span> : null}
            {comment.rating ? <span style={{ color: '#d97706' }}> · {comment.rating}/5</span> : null}
            <p style={{ color: '#334155' }}>{comment.body}</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" onClick={() => update(comment.id, 'approved')} style={btn}>Aprobă</button>
              <button type="button" onClick={() => update(comment.id, 'rejected')} style={btn}>Respinge</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const btn: CSSProperties = { background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.4rem 0.7rem', cursor: 'pointer', fontWeight: 600 }

export default BlogComments
