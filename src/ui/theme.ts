import type { CSSProperties } from 'react'

export const colors = {
  ink: '#0f172a',
  slate: '#1e293b',
  muted: '#64748b',
  green: '#10b981',
  greenDark: '#059669',
  page: '#f8fafc',
  white: '#ffffff',
  line: '#eef2f6',
  fieldLine: '#e2e8f0'
}

export const pageShell: CSSProperties = {
  minHeight: '100vh',
  background: colors.page
}

export const hero: CSSProperties = {
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #0f172a 60%, #1e293b 100%)',
  color: colors.white,
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  padding: '4.5rem 1.25rem 3rem'
}

export const heroOverlay: CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'radial-gradient(circle at 30% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)',
  pointerEvents: 'none'
}

export const heroTitle: CSSProperties = {
  margin: 0,
  color: colors.white,
  fontWeight: 700,
  letterSpacing: '-0.02em',
  lineHeight: 1.2,
  fontSize: 'clamp(2rem, 4vw, 3rem)'
}

export const SITE_MAX_WIDTH = '1400px'

export const column: CSSProperties = {
  maxWidth: SITE_MAX_WIDTH,
  margin: '0 auto',
  position: 'relative',
  zIndex: 1,
  width: '100%',
  boxSizing: 'border-box'
}

/** Padding orizontal ca în `<header>` (App.tsx). */
export function siteHorizontalPadding(isMobile: boolean): CSSProperties {
  return {
    paddingLeft: isMobile ? '1rem' : '2rem',
    paddingRight: isMobile ? '1rem' : '2rem'
  }
}

/** Container 1400px — fără padding interior (ca header-ul). */
export function siteContainer(): CSSProperties {
  return { ...column }
}

export const contentBand: CSSProperties = {
  background: colors.white,
  padding: '2.5rem 1.25rem 4rem'
}

export const card: CSSProperties = {
  background: colors.white,
  border: `1px solid ${colors.line}`,
  borderRadius: '16px'
}

export const primaryButton: CSSProperties = {
  display: 'inline-block',
  padding: '0.75rem 1.15rem',
  background: colors.green,
  color: colors.white,
  border: 'none',
  borderRadius: '999px',
  fontSize: '0.95rem',
  fontWeight: 700,
  fontFamily: 'inherit',
  cursor: 'pointer',
  textDecoration: 'none',
  textAlign: 'center'
}

export const secondaryButton: CSSProperties = {
  ...primaryButton,
  background: colors.ink
}

export const dangerButton: CSSProperties = {
  ...primaryButton,
  background: '#ef4444'
}

export const disabledButton: CSSProperties = {
  ...primaryButton,
  background: '#e5e7eb',
  color: colors.muted,
  cursor: 'not-allowed'
}

export const field: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '0.85rem 0.95rem',
  border: `1px solid ${colors.fieldLine}`,
  borderRadius: '12px',
  fontSize: '1rem',
  outline: 'none',
  background: colors.page,
  color: colors.ink,
  fontFamily: 'inherit'
}

export function focusedField(active: boolean): CSSProperties {
  return {
    ...field,
    border: `1px solid ${active ? colors.green : colors.fieldLine}`,
    boxShadow: active ? '0 0 0 3px rgba(16, 185, 129, 0.15)' : 'none'
  }
}

export const fieldLabel: CSSProperties = {
  display: 'block',
  color: colors.ink,
  fontWeight: 700,
  fontSize: '0.9rem'
}

export const loginShell: CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #0f172a 100%)',
  padding: '3rem 1rem'
}

export const loginGlow: CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.16) 0%, transparent 42%), radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.12) 0%, transparent 40%)',
  pointerEvents: 'none'
}

export const loginCard: CSSProperties = {
  ...card,
  position: 'relative',
  borderRadius: '20px',
  padding: '2rem 1.5rem',
  maxWidth: '440px',
  width: '100%',
  boxShadow: '0 24px 60px rgba(15, 23, 42, 0.28)'
}
