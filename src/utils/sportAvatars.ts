import { createAvatar } from '@dicebear/core'
import { adventurer, avataaars, bottts, croodles, funEmoji } from '@dicebear/collection'
import type { Style } from '@dicebear/core'

/** Stiluri DiceBear amuzante — același seed = același avatar (https://www.dicebear.com). */
const FUN_AVATAR_STYLES: Style<any>[] = [funEmoji, adventurer, avataaars, bottts, croodles]

const AVATAR_BACKGROUNDS = ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf', 'a7f3d0', 'fde68a']

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

function pickStyle(seed: string): Style<any> {
  return FUN_AVATAR_STYLES[hashString(seed) % FUN_AVATAR_STYLES.length]
}

/** SVG ca data URI — generat local, fără API extern. */
export function createFunAvatarDataUri(seed: string | number, size = 128): string {
  const key = String(seed)
  return createAvatar(pickStyle(key), {
    seed: key,
    size,
    backgroundColor: AVATAR_BACKGROUNDS,
    backgroundType: ['solid', 'gradientLinear']
  }).toDataUri()
}

export function sportAvatarSeed(user: { id?: number; username?: string; accountKind?: string } | null): string {
  if (!user) return 'guest'
  if (user.id != null) return `${user.accountKind || 'user'}-${user.id}`
  return user.username || 'guest'
}

/** URL pentru poză încărcată de utilizator (/uploads/...). */
export function resolveMemberPhotoUrl(customUrl?: string | null): string | undefined {
  const trimmed = String(customUrl || '').trim()
  if (!trimmed) return undefined
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
  if (trimmed.startsWith('/')) return trimmed
  return `/${trimmed}`
}
