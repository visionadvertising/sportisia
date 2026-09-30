import API_BASE_URL from '../config'
import { authHeaders, isMemberSession } from './memberSession'

let memberSavedCache: number[] | null = null

export function readSavedIds(): number[] {
  if (!isMemberSession()) return []
  return memberSavedCache ?? []
}

export async function refreshMemberSavedIds(): Promise<number[]> {
  if (!isMemberSession()) {
    memberSavedCache = null
    return []
  }
  const response = await fetch(`${API_BASE_URL}/member/saved-facilities`, { headers: authHeaders() })
  const data = await response.json()
  memberSavedCache = data.success && Array.isArray(data.data) ? data.data.map(Number) : []
  window.dispatchEvent(new Event('sportisia-saved'))
  return memberSavedCache
}

export function isSaved(id: number) {
  return readSavedIds().includes(id)
}

export async function toggleSaved(id: number): Promise<{ saved: boolean; needsLogin?: boolean }> {
  if (!isMemberSession()) {
    return { saved: false, needsLogin: true }
  }

  const response = await fetch(`${API_BASE_URL}/member/saved-facilities/${id}/toggle`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' }
  })
  if (response.status === 401) {
    return { saved: false, needsLogin: true }
  }
  const data = await response.json()
  if (data.success) {
    const current = memberSavedCache ?? []
    memberSavedCache = data.saved
      ? [...new Set([id, ...current])]
      : current.filter((item) => item !== id)
    window.dispatchEvent(new Event('sportisia-saved'))
    return { saved: Boolean(data.saved) }
  }
  return { saved: isSaved(id) }
}

export function clearMemberSavedCache() {
  memberSavedCache = null
}
