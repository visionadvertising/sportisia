'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { SportsField } from '@/lib/types';
import { getCityFromSlug, isValidCitySlug } from '@/lib/cities';
import ToastContainer from '@/components/ToastContainer';
import { useToast } from '@/hooks/useToast';
import FieldCardSkeleton from '@/components/FieldCardSkeleton';
import HorizontalCard from '@/components/HorizontalCard';

const sportTypes = ['tenis', 'fotbal', 'baschet', 'volei', 'handbal', 'alte'];

export default function CitySportFieldsPage() {
  const params = useParams();
  const router = useRouter();
  const [fields, setFields] = useState<SportsField[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const { toasts, removeToast, error: showError } = useToast();

  const citySlug = params.city as string;
  const sport = params.sport as string;
  const city = getCityFromSlug(citySlug);

  useEffect(() => {
    if (!isValidCitySlug(citySlug) || !sportTypes.includes(sport)) {
      router.push('/');
      return;
    }
    fetchFields();
  }, [citySlug, sport]);

  const fetchFields = async () => {
    try {
      const response = await fetch('/api/fields');
      if (!response.ok) {
        throw new Error('Eroare la încărcarea terenurilor');
      }
      const data = await response.json();
      // Filter by city and sport
      const filtered = data.filter((field: SportsField) =>
        field.city === city && field.type === sport
      );
      setFields(filtered);
    } catch (error) {
      console.error('Error fetching fields:', error);
      showError('Nu s-au putut încărca terenurile. Te rugăm să reîncerci.');
    } finally {
      setLoading(false);
    }
  };

  const sortedFields = [...fields].sort((a, b) => {
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

  if (!city) {
    return null;
  }

  return (
    <div>
      <div style={{
        background: 'linear-gradient(180deg, #0d9488 0%, #0891b2 30%, #06b6d4 60%, #67e8f9 100%)',
        color: 'white',
        padding: '60px 0 40px',
        marginBottom: '0'
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <Link href="/" style={{ color: 'white', marginBottom: '16px', display: 'inline-block', opacity: 0.9 }}>
            ← Înapoi la Home
          </Link>
          <h1 style={{
            fontSize: '3rem',
            marginBottom: '12px',
            fontWeight: '700',
            letterSpacing: '-1px'
          }}>
            Terenuri {getSportLabel(sport)} în {city}
          </h1>
          <p style={{
            fontSize: '1.2rem',
            opacity: 0.95,
            marginBottom: '20px'
          }}>
            Găsește terenuri de {getSportLabel(sport).toLowerCase()} disponibile pentru închiriere
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
              {sortedFields.length} teren{sortedFields.length !== 1 ? 'uri' : ''} disponibil{sortedFields.length !== 1 ? 'e' : ''}
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
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
            <Link href="/add-field" className="btn btn-primary" style={{
              whiteSpace: 'nowrap',
              background: '#0d9488'
            }}>
              + Adaugă Teren
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <FieldCardSkeleton key={i} />
            ))}
          </div>
        ) : sortedFields.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '20px' }}>
              Nu există terenuri de {getSportLabel(sport).toLowerCase()} disponibile în {city} momentan.
            </p>
            <Link href="/add-field" className="btn btn-primary" style={{ background: '#0d9488' }}>
              Adaugă primul teren
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {sortedFields.map((field) => (
              <HorizontalCard
                key={field.id}
                item={field}
                type="field"
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

