import { useMemo, useEffect, useState, type CSSProperties } from 'react'
import { createFunAvatarDataUri, resolveMemberPhotoUrl } from '../utils/sportAvatars'

type SportAvatarProps = {
  seed: string | number
  customUrl?: string | null
  size?: number
  alt?: string
  style?: CSSProperties
  ring?: boolean
}

export function SportAvatar({ seed, customUrl, size = 48, alt = '', style, ring = false }: SportAvatarProps) {
  const photoUrl = resolveMemberPhotoUrl(customUrl)
  const [usePhoto, setUsePhoto] = useState(Boolean(photoUrl))
  const funAvatarSrc = useMemo(
    () => createFunAvatarDataUri(seed, Math.max(64, Math.min(256, size * 2))),
    [seed, size]
  )

  useEffect(() => {
    setUsePhoto(Boolean(resolveMemberPhotoUrl(customUrl)))
  }, [customUrl])

  const shellStyle: CSSProperties = {
    display: 'inline-flex',
    flexShrink: 0,
    width: size,
    height: size,
    borderRadius: '50%',
    overflow: 'hidden',
    background: '#e2e8f0',
    boxShadow: ring ? '0 0 0 2px rgba(110, 231, 183, 0.4)' : undefined,
    alignItems: 'center',
    justifyContent: 'center',
    ...style
  }

  const imgStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block'
  }

  if (usePhoto && photoUrl) {
    return (
      <span style={shellStyle}>
        <img
          src={photoUrl}
          alt={alt}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          onError={() => setUsePhoto(false)}
          style={imgStyle}
        />
      </span>
    )
  }

  return (
    <span style={shellStyle} role={alt ? 'img' : undefined} aria-label={alt || undefined}>
      <img src={funAvatarSrc} alt={alt || 'Avatar'} width={size} height={size} decoding="async" style={imgStyle} />
    </span>
  )
}
