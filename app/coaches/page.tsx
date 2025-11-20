'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Coach } from '@/lib/types';
import ToastContainer from '@/components/ToastContainer';
import { useToast } from '@/hooks/useToast';
import FieldCardSkeleton from '@/components/FieldCardSkeleton';
import HorizontalCard from '@/components/HorizontalCard';

type SortOption = 'name' | 'price-asc' | 'price-desc' | 'date-desc' | 'date-asc';

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const { toasts, removeToast, error: showError } = useToast();

  useEffect(() => {
    fetchCoaches();
    // Apply URL params if present
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sport = params.get('sport');
      const location = params.get('location');
      if (sport) setFilter(sport);
      if (location) setSearchQuery(location);
    }
  }, []);

  const fetchCoaches = async () => {
    try {
      const response = await fetch('/api/coaches');
      if (!response.ok) {
        throw new Error('Eroare la încărcarea antrenorilor');
      }
      const data = await response.json();
      setCoaches(data);
    } catch (error) {
      console.error('Error fetching coaches:', error);
      showError('Nu s-au putut încărca antrenorii. Te rugăm să reîncerci.');
    } finally {
      setLoading(false);
    }
  };

  let filteredCoaches = filter === 'all' 
    ? coaches 
    : coaches.filter(coach => coach.sport === filter);

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredCoaches = filteredCoaches.filter(coach =>
      coach.name.toLowerCase().includes(query) ||
      coach.city.toLowerCase().includes(query) ||
      (coach.location && coach.location.toLowerCase().includes(query)) ||
      coach.description.toLowerCase().includes(query) ||
      coach.experience.toLowerCase().includes(query)
    );
  }

  filteredCoaches = [...filteredCoaches].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price-asc':
        return (a.pricePerHour || 0) - (b.pricePerHour || 0);
      case 'price-desc':
        return (b.pricePerHour || 0) - (a.pricePerHour || 0);
      case 'date-desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'date-asc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      default:
        return 0;
    }
  });

  const getSportLabel = (sport: string) => {
    const labels: Record<string, string> = {
      'tenis': 'Tenis',
      'fotbal': 'Fotbal',
      'baschet': 'Baschet',
      'volei': 'Volei',
      'handbal': 'Handbal',
      'alte': 'Alte'
    };
    return labels[sport] || sport;
  };

  return (
    <div>
      <div style={{
        background: 'linear-gradient(180deg, #0d9488 0%, #0891b2 30%, #06b6d4 60%, #67e8f9 100%)',
        color: 'white',
        padding: '80px 0 60px',
        marginBottom: '0'
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: '3.5rem',
            marginBottom: '20px',
            fontWeight: '700',
            letterSpacing: '-1px',
            lineHeight: '1.1'
          }}>
            Antrenori Sportivi
          </h1>
          <p style={{
            fontSize: '1.35rem',
            opacity: 0.95,
            marginBottom: '40px',
            maxWidth: '650px',
            margin: '0 auto 40px',
            fontWeight: '300'
          }}>
            Găsește antrenorul perfect pentru tine
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '60px', paddingBottom: '40px' }}>
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
            {!loading && filteredCoaches.length > 0 && (
              <>
                Există peste {coaches.length} Antrenori în România. Iată câțiva dintre ei:
              </>
            )}
            {!loading && filteredCoaches.length === 0 && 'Antrenori disponibili'}
          </h2>
          {!loading && filteredCoaches.length > 0 && (
            <p style={{ color: '#6b7280', fontSize: '15px' }}>
              Afișați {filteredCoaches.length} din {coaches.length} antrenori
            </p>
          )}
        </div>

        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="🔍 Caută după nume, oraș sau experiență..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: '1',
                minWidth: '250px',
                padding: '10px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '15px',
                backgroundColor: 'white'
              }}
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              style={{
                padding: '10px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '15px',
                cursor: 'pointer',
                backgroundColor: 'white',
                color: '#374151'
              }}
            >
              <option value="date-desc">Cele mai noi</option>
              <option value="date-asc">Cele mai vechi</option>
              <option value="name">Nume (A-Z)</option>
              <option value="price-asc">Preț (crescător)</option>
              <option value="price-desc">Preț (descrescător)</option>
            </select>
            <Link href="/add-coach" className="btn btn-primary" style={{
              whiteSpace: 'nowrap',
              background: '#0d9488'
            }}>
              + Adaugă Antrenor
            </Link>
          </div>
        </div>

        {/* Filter Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '40px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '10px 20px',
              fontSize: '15px',
              fontWeight: filter === 'all' ? '600' : '400',
              borderRadius: '8px',
              border: '2px solid',
              borderColor: filter === 'all' ? '#0d9488' : '#e5e7eb',
              background: filter === 'all' ? '#0d9488' : 'white',
              color: filter === 'all' ? 'white' : '#374151',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Toate ({coaches.length})
          </button>
          <button
            onClick={() => setFilter('tenis')}
            style={{
              padding: '10px 20px',
              fontSize: '15px',
              fontWeight: filter === 'tenis' ? '600' : '400',
              borderRadius: '8px',
              border: '2px solid',
              borderColor: filter === 'tenis' ? '#0d9488' : '#e5e7eb',
              background: filter === 'tenis' ? '#0d9488' : 'white',
              color: filter === 'tenis' ? 'white' : '#374151',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Tenis ({coaches.filter(c => c.sport === 'tenis').length})
          </button>
          <button
            onClick={() => setFilter('fotbal')}
            style={{
              padding: '10px 20px',
              fontSize: '15px',
              fontWeight: filter === 'fotbal' ? '600' : '400',
              borderRadius: '8px',
              border: '2px solid',
              borderColor: filter === 'fotbal' ? '#0d9488' : '#e5e7eb',
              background: filter === 'fotbal' ? '#0d9488' : 'white',
              color: filter === 'fotbal' ? 'white' : '#374151',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Fotbal ({coaches.filter(c => c.sport === 'fotbal').length})
          </button>
          <button
            onClick={() => setFilter('baschet')}
            style={{
              padding: '10px 20px',
              fontSize: '15px',
              fontWeight: filter === 'baschet' ? '600' : '400',
              borderRadius: '8px',
              border: '2px solid',
              borderColor: filter === 'baschet' ? '#0d9488' : '#e5e7eb',
              background: filter === 'baschet' ? '#0d9488' : 'white',
              color: filter === 'baschet' ? 'white' : '#374151',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Baschet ({coaches.filter(c => c.sport === 'baschet').length})
          </button>
          <button
            onClick={() => setFilter('volei')}
            style={{
              padding: '10px 20px',
              fontSize: '15px',
              fontWeight: filter === 'volei' ? '600' : '400',
              borderRadius: '8px',
              border: '2px solid',
              borderColor: filter === 'volei' ? '#0d9488' : '#e5e7eb',
              background: filter === 'volei' ? '#0d9488' : 'white',
              color: filter === 'volei' ? 'white' : '#374151',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Volei ({coaches.filter(c => c.sport === 'volei').length})
          </button>
        </div>

        {loading ? (
          <div className="grid grid-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <FieldCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredCoaches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '8px' }}>
              {searchQuery ? 'Nu s-au găsit antrenori care să corespundă căutării.' : 'Nu există antrenori disponibili momentan.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="btn btn-secondary"
                style={{ marginTop: '12px', marginRight: '8px' }}
              >
                Șterge căutarea
              </button>
            )}
            <Link href="/add-coach" className="btn btn-primary" style={{ marginTop: '12px', background: '#0d9488' }}>
              Adaugă antrenor
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredCoaches.map((coach) => (
              <HorizontalCard
                key={coach.id}
                item={coach}
                type="coach"
                getSportLabel={getSportLabel}
              />
            ))}
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

