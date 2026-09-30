export type SessionUser = {
  id: number
  username: string
  email: string
  accountKind?: 'member' | 'business'
  firstName?: string | null
  lastName?: string | null
  avatarUrl?: string | null
  facilityId?: number | null
}

export const AUTH_EVENT = 'sportisia-auth'

export function readSessionUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    const parsed = JSON.parse(raw) as SessionUser
    if (!parsed?.username) return null
    return parsed
  } catch {
    return null
  }
}

export function isMemberSession(): boolean {
  const user = readSessionUser()
  return Boolean(user && user.accountKind === 'member' && localStorage.getItem('userToken'))
}

export function isBusinessSession(): boolean {
  const user = readSessionUser()
  return Boolean(user && user.accountKind === 'business' && localStorage.getItem('userToken'))
}

export function hasUserSession(): boolean {
  return Boolean(localStorage.getItem('userToken') && readSessionUser())
}

export function clearUserSession() {
  localStorage.removeItem('user')
  localStorage.removeItem('userToken')
  notifyAuthChange()
}

export function notifyAuthChange() {
  window.dispatchEvent(new Event(AUTH_EVENT))
}

export function writeSessionUser(user: SessionUser) {
  localStorage.setItem('user', JSON.stringify(user))
  notifyAuthChange()
}

export function authHeaders(): HeadersInit {
  const token = localStorage.getItem('userToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}
