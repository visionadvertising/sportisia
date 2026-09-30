import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const nativeFetch = window.fetch.bind(window)
window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
  const headers = new Headers(init?.headers)
  if (input instanceof Request) {
    input.headers.forEach((value, key) => {
      if (!headers.has(key)) headers.set(key, value)
    })
  }
  const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase()
  if (url.includes('/api/admin/') && !url.includes('/api/admin/login')) {
    const token = localStorage.getItem('adminToken')
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }
  const claim = url.match(/\/api\/claims\/(\d+)/)
  if (claim) {
    const token = sessionStorage.getItem(`claimToken:${claim[1]}`)
    if (token) headers.set('X-Claim-Token', token)
  }
  const facilityWrite = method === 'PUT' && /\/api\/facilities\/\d+/.test(url)
  if (
    url.includes('/api/member/') ||
    url.includes('/api/my-facility') ||
    url.includes('/api/users/reset-password') ||
    (facilityWrite && !window.location.pathname.startsWith('/admin'))
  ) {
    const token = localStorage.getItem('userToken')
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }
  if (facilityWrite && window.location.pathname.startsWith('/admin')) {
    const token = localStorage.getItem('adminToken')
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }
  return nativeFetch(input, { ...init, headers })
}) as typeof window.fetch

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

