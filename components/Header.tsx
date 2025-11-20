'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/', label: 'Terenuri' },
    { href: '/coaches', label: 'Antrenori' },
  ];

  return (
    <header style={{
      background: 'linear-gradient(180deg, #0d9488 0%, #0891b2 100%)',
      color: 'white',
      padding: '20px 0',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
          color: 'white'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            background: '#10b981',
            transform: 'rotate(45deg)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              background: 'white',
              borderRadius: '2px',
              transform: 'rotate(-45deg)'
            }} />
          </div>
          <span style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            letterSpacing: '1px'
          }}>
            SPORTISIARO
          </span>
        </Link>

        <nav style={{
          display: 'flex',
          gap: '32px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                color: 'white',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: pathname === item.href ? '600' : '400',
                padding: '6px 0',
                borderBottom: pathname === item.href ? '2px solid white' : '2px solid transparent',
                transition: 'all 0.2s ease',
                opacity: pathname === item.href ? 1 : 0.9
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                if (pathname !== item.href) {
                  e.currentTarget.style.opacity = '0.9';
                }
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

