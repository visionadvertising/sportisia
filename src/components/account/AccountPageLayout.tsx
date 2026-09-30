import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { SportAvatar } from '../SportAvatar'
import { card, colors, heroOverlay, pageShell, siteContainer, siteHorizontalPadding } from '../../ui/theme'

type AccountPageLayoutProps = {
  eyebrow: string
  title: string
  subtitle?: string
  avatarSeed?: string | number
  avatarUrl?: string | null
  isMobile: boolean
  actions?: ReactNode
  children: ReactNode
}

export function AccountPageLayout({
  eyebrow,
  title,
  subtitle,
  avatarSeed,
  avatarUrl,
  isMobile,
  actions,
  children
}: AccountPageLayoutProps) {
  return (
    <div style={pageShell}>
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #0f172a 60%, #1e293b 100%)',
          color: colors.white,
          paddingTop: isMobile ? '1.75rem' : '2.5rem',
          paddingBottom: isMobile ? '2rem' : '2.75rem',
          ...siteHorizontalPadding(isMobile)
        }}
      >
        <div style={heroOverlay} aria-hidden />
        <div style={{ ...siteContainer(), position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'stretch' : 'flex-end',
              justifyContent: 'space-between',
              gap: '1.25rem'
            }}
          >
            <div
              style={{
                minWidth: 0,
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '0.75rem' : '0.9rem'
              }}
            >
              {avatarSeed != null ? (
                <SportAvatar
                  seed={avatarSeed}
                  customUrl={avatarUrl}
                  size={isMobile ? 44 : 52}
                  ring
                  alt=""
                  style={{
                    alignSelf: isMobile ? 'flex-start' : 'center',
                    marginRight: isMobile ? '0.15rem' : '0.25rem'
                  }}
                />
              ) : null}
              <div style={{ minWidth: 0 }}>
                <p style={eyebrowStyle}>{eyebrow}</p>
                <h1 style={{ ...titleStyle, fontSize: isMobile ? '1.55rem' : 'clamp(1.75rem, 3vw, 2.25rem)' }}>{title}</h1>
                {subtitle ? <p style={subtitleStyle}>{subtitle}</p> : null}
              </div>
            </div>
            {actions ? (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  alignItems: 'center',
                  justifyContent: isMobile ? 'flex-start' : 'flex-end',
                  flexShrink: 0
                }}
              >
                {actions}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div
        style={{
          background: colors.white,
          paddingTop: isMobile ? '1.5rem' : '2rem',
          paddingBottom: isMobile ? '2.5rem' : '3.5rem',
          ...siteHorizontalPadding(isMobile)
        }}
      >
        <div style={siteContainer()}>{children}</div>
      </div>
    </div>
  )
}

export function AccountCard({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        ...card,
        boxShadow: '0 4px 24px rgba(15, 23, 42, 0.05)',
        padding: '1.35rem 1.4rem',
        ...style
      }}
    >
      {children}
    </div>
  )
}

export function AccountTabs({
  tabs,
  active,
  onChange,
  isMobile
}: {
  tabs: { id: string; label: string }[]
  active: string
  onChange: (id: string) => void
  isMobile: boolean
}) {
  return (
    <div
      style={{
        ...card,
        display: 'flex',
        gap: '0.35rem',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        marginBottom: '1.25rem',
        padding: '0.35rem',
        boxShadow: '0 2px 12px rgba(15, 23, 42, 0.04)'
      }}
    >
      {tabs.map((tab) => {
        const on = tab.id === active
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            style={{
              flex: isMobile ? '0 0 auto' : 1,
              padding: isMobile ? '0.65rem 1rem' : '0.75rem 1rem',
              border: 'none',
              borderRadius: '12px',
              background: on ? colors.green : 'transparent',
              color: on ? colors.white : colors.muted,
              fontWeight: on ? 700 : 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background 0.2s ease, color 0.2s ease'
            }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export function accountActionButton(variant: 'primary' | 'ghost' | 'danger'): CSSProperties {
  if (variant === 'primary') {
    return {
      padding: '0.6rem 1.05rem',
      borderRadius: '10px',
      background: colors.green,
      color: colors.white,
      border: 'none',
      fontWeight: 600,
      fontSize: '0.875rem',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      cursor: 'pointer'
    }
  }
  if (variant === 'danger') {
    return {
      padding: '0.6rem 1.05rem',
      borderRadius: '10px',
      background: 'rgba(255,255,255,0.08)',
      color: '#fecaca',
      border: '1px solid rgba(254, 202, 202, 0.35)',
      fontWeight: 600,
      fontSize: '0.875rem',
      cursor: 'pointer'
    }
  }
  return {
    padding: '0.6rem 1.05rem',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.12)',
    color: colors.white,
    border: '1px solid rgba(255,255,255,0.2)',
    fontWeight: 600,
    fontSize: '0.875rem',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    cursor: 'pointer'
  }
}

export function AccountField({
  label,
  children
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label style={{ display: 'grid', gap: '0.35rem', fontSize: '0.9rem', color: colors.ink, fontWeight: 700 }}>
      {label}
      {children}
    </label>
  )
}

export const accountInputStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '0.85rem 0.95rem',
  borderRadius: '12px',
  border: `1px solid ${colors.fieldLine}`,
  background: colors.page,
  fontSize: '1rem',
  fontFamily: 'inherit',
  outline: 'none'
}

export function AccountHomeLink({ isMobile }: { isMobile: boolean }) {
  return (
    <Link to="/" style={accountActionButton('ghost')}>
      {isMobile ? 'Acasă' : 'Înapoi acasă'}
    </Link>
  )
}

const eyebrowStyle: CSSProperties = {
  margin: '0 0 0.35rem',
  color: '#6ee7b7',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  fontSize: '0.72rem'
}

const titleStyle: CSSProperties = {
  margin: 0,
  color: colors.white,
  letterSpacing: '-0.03em',
  lineHeight: 1.15,
  fontWeight: 700
}

const subtitleStyle: CSSProperties = {
  margin: '0.45rem 0 0',
  color: 'rgba(255,255,255,0.75)',
  fontSize: '0.95rem'
}
