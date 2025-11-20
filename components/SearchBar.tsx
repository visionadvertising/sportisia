'use client';

import { useState } from 'react';
import { ROMANIAN_CITIES, getSlugFromCity } from '@/lib/cities';

interface SearchBarProps {
  onSearch: (query: { location: string; sport: string; serviceType: string }) => void;
  onMoreFilters: () => void;
}

export default function SearchBar({ onSearch, onMoreFilters }: SearchBarProps) {
  const [location, setLocation] = useState('');
  const [sport, setSport] = useState('');
  const [serviceType, setServiceType] = useState('');

  const handleSearch = () => {
    onSearch({ location, sport, serviceType });
  };

  return (
    <div style={{
      maxWidth: '1000px',
      margin: '0 auto',
      background: 'white',
      borderRadius: '16px',
      padding: '0',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
      display: 'flex',
      alignItems: 'stretch',
      overflow: 'hidden'
    }}>
      <div style={{
        flex: 1,
        padding: '20px 24px',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '80px'
      }}>
        <div style={{
          fontSize: '13px',
          color: '#6b7280',
          fontWeight: '500',
          marginBottom: '6px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Locație
        </div>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{
            border: 'none',
            outline: 'none',
            fontSize: '16px',
            color: '#111827',
            width: '100%',
            background: 'transparent',
            cursor: 'pointer',
            padding: '0',
            fontWeight: '400',
            appearance: 'none',
            backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%236b7280\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right center',
            paddingRight: '20px'
          }}
        >
          <option value="">Location</option>
          {ROMANIAN_CITIES.map(city => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      <div style={{
        flex: 1,
        padding: '20px 24px',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '80px'
      }}>
        <div style={{
          fontSize: '13px',
          color: '#6b7280',
          fontWeight: '500',
          marginBottom: '6px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Sport
        </div>
        <select
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          style={{
            border: 'none',
            outline: 'none',
            fontSize: '16px',
            color: '#111827',
            width: '100%',
            background: 'transparent',
            cursor: 'pointer',
            padding: '0',
            fontWeight: '400',
            appearance: 'none',
            backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%236b7280\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right center',
            paddingRight: '20px'
          }}
        >
          <option value="">Sport</option>
          <option value="tenis">Tenis</option>
          <option value="fotbal">Fotbal</option>
          <option value="baschet">Baschet</option>
          <option value="volei">Volei</option>
          <option value="handbal">Handbal</option>
          <option value="alte">Alte</option>
        </select>
      </div>

      <div style={{
        flex: 1,
        padding: '20px 24px',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '80px'
      }}>
        <div style={{
          fontSize: '13px',
          color: '#6b7280',
          fontWeight: '500',
          marginBottom: '6px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Tip serviciu
        </div>
        <select
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
          style={{
            border: 'none',
            outline: 'none',
            fontSize: '16px',
            color: '#111827',
            width: '100%',
            background: 'transparent',
            cursor: 'pointer',
            padding: '0',
            fontWeight: '400',
            appearance: 'none',
            backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%236b7280\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right center',
            paddingRight: '20px'
          }}
        >
          <option value="">Service type</option>
          <option value="inchiriere">Închiriere teren</option>
          <option value="antrenor">Rezervare cu antrenor</option>
        </select>
      </div>

      <button
        onClick={handleSearch}
        style={{
          width: '80px',
          minHeight: '80px',
          background: '#0d9488',
          border: 'none',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s ease',
          flexShrink: 0
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#0f766e';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#0d9488';
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
      </button>
    </div>
  );
}

