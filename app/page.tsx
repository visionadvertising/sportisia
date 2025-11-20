'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SportsField } from '@/lib/types';
import ToastContainer from '@/components/ToastContainer';
import { useToast } from '@/hooks/useToast';
import FieldCardSkeleton from '@/components/FieldCardSkeleton';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import MoreFilters from '@/components/MoreFilters';
import HorizontalCard from '@/components/HorizontalCard';

type SortOption = 'name' | 'price-asc' | 'price-desc' | 'date-desc' | 'date-asc';

export default function Home() {
  const [fields, setFields] = useState<SportsField[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<{
    minPrice?: number;
    maxPrice?: number;
    amenities: string[];
    city?: string;
  }>({
    amenities: [],
  });
  const [searchParams, setSearchParams] = useState<{
    location: string;
    sport: string;
    serviceType: string;
  }>({
    location: '',
    sport: '',
    serviceType: '',
  });
  const { toasts, removeToast, error: showError } = useToast();

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      const response = await fetch('/api/fields');
      if (!response.ok) {
        throw new Error('Eroare la încărcarea terenurilor');
      }
      const data = await response.json();
      setFields(data);
    } catch (error) {
      console.error('Error fetching fields:', error);
      showError('Nu s-au putut încărca terenurile. Te rugăm să reîncerci.');
    } finally {
      setLoading(false);
    }
  };

  // Filter and search
  let filteredFields = filter === 'all' 
    ? fields 
    : fields.filter(field => field.type === filter);

  // Apply search bar filters
  if (searchParams.location.trim()) {
    const location = searchParams.location.toLowerCase();
    filteredFields = filteredFields.filter(field =>
      field.location.toLowerCase().includes(location) ||
      field.city.toLowerCase().includes(location)
    );
  }

  if (searchParams.sport) {
    filteredFields = filteredFields.filter(field => field.type === searchParams.sport);
  }

  // Apply advanced filters
  if (advancedFilters.city) {
    filteredFields = filteredFields.filter(field =>
      field.city.toLowerCase().includes(advancedFilters.city!.toLowerCase())
    );
  }

  if (advancedFilters.minPrice !== undefined) {
    filteredFields = filteredFields.filter(field =>
      field.pricePerHour && field.pricePerHour >= advancedFilters.minPrice!
    );
  }

  if (advancedFilters.maxPrice !== undefined) {
    filteredFields = filteredFields.filter(field =>
      field.pricePerHour && field.pricePerHour <= advancedFilters.maxPrice!
    );
  }

  if (advancedFilters.amenities.length > 0) {
    filteredFields = filteredFields.filter(field =>
      advancedFilters.amenities.every(amenity =>
        field.amenities.includes(amenity)
      )
    );
  }

  // Apply text search
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredFields = filteredFields.filter(field =>
      field.name.toLowerCase().includes(query) ||
      field.location.toLowerCase().includes(query) ||
      field.city.toLowerCase().includes(query) ||
      field.description.toLowerCase().includes(query)
    );
  }

  // Sort
  filteredFields = [...filteredFields].sort((a, b) => {
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

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'tenis': 'Tenis',
      'fotbal': 'Fotbal',
      'baschet': 'Baschet',
      'volei': 'Volei',
      'handbal': 'Handbal',
      'alte': 'Alte'
    };
    return labels[type] || type;
  };

  const handleSearch = (params: { location: string; sport: string; serviceType: string }) => {
    const { getSlugFromCity } = require('@/lib/cities');
    
    // If location and sport are selected, redirect to city/sport page
    if (params.location && params.sport) {
      const citySlug = getSlugFromCity(params.location);
      
      if (params.serviceType === 'antrenor') {
        window.location.href = `/${citySlug}/${params.sport}/antrenori`;
        return;
      } else if (params.serviceType === 'inchiriere' || !params.serviceType) {
        window.location.href = `/${citySlug}/${params.sport}/terenuri`;
        return;
      }
    }
    
    // Fallback to local filtering
    setSearchParams(params);
    if (params.serviceType === 'antrenor') {
      const query = new URLSearchParams();
      if (params.location) query.set('location', params.location);
      if (params.sport) query.set('sport', params.sport);
      window.location.href = `/coaches?${query.toString()}`;
      return;
    }
    if (params.sport) {
      setFilter(params.sport);
    }
  };

  const handleApplyAdvancedFilters = (filters: typeof advancedFilters) => {
    setAdvancedFilters(filters);
  };

  return (
    <div>

      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(180deg, #0d9488 0%, #0891b2 30%, #06b6d4 60%, #67e8f9 100%)',
        color: 'white',
        padding: '80px 0 100px',
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
            o Comunitate Sportivă Mondială
          </h1>
          <p style={{
            fontSize: '1.35rem',
            opacity: 0.95,
            marginBottom: '50px',
            maxWidth: '650px',
            margin: '0 auto 50px',
            fontWeight: '300'
          }}>
            Găsește ce ai nevoie în câteva secunde
          </p>

          <div style={{ marginBottom: '24px' }}>
            <SearchBar onSearch={handleSearch} onMoreFilters={() => setShowMoreFilters(true)} />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginTop: '20px',
            cursor: 'pointer',
            color: 'white',
            fontSize: '15px',
            fontWeight: '400'
          }}
          onClick={() => setShowMoreFilters(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          >
            <span>==</span>
            <span>More filters</span>
          </div>

        </div>
      </div>

      <div className="container" style={{ paddingTop: '60px', paddingBottom: '40px' }}>
        {/* Results Section */}
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
              Terenuri disponibile
            </h2>
            {!loading && (
              <p style={{ color: '#6b7280', fontSize: '15px' }}>
                {filteredFields.length} teren{filteredFields.length !== 1 ? 'uri' : ''} găsit{filteredFields.length !== 1 ? 'e' : ''}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
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
            <Link href="/add-field" className="btn btn-primary" style={{
              whiteSpace: 'nowrap',
              background: '#0d9488'
            }}>
              + Adaugă Teren
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
            Toate ({fields.length})
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
            Tenis ({fields.filter(f => f.type === 'tenis').length})
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
            Fotbal ({fields.filter(f => f.type === 'fotbal').length})
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
            Baschet ({fields.filter(f => f.type === 'baschet').length})
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
            Volei ({fields.filter(f => f.type === 'volei').length})
          </button>
        </div>

        {loading ? (
          <div className="grid grid-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <FieldCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredFields.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '8px' }}>
              {searchQuery ? 'Nu s-au găsit terenuri care să corespundă căutării.' : 'Nu există terenuri disponibile momentan.'}
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
            <Link href="/add-field" className="btn btn-primary" style={{ marginTop: '12px' }}>
              Adaugă teren
            </Link>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '20px', color: '#6b7280' }}>
              <p>Găsite {filteredFields.length} teren{filteredFields.length !== 1 ? 'uri' : ''}</p>
            </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredFields.map((field) => (
              <HorizontalCard
                key={field.id}
                item={field}
                type="field"
                getSportLabel={getTypeLabel}
              />
            ))}
          </div>
          </>
        )}
      </div>

      <footer style={{
        marginTop: '60px',
        padding: '40px 0',
        background: '#1f2937',
        color: 'white',
        textAlign: 'center'
      }}>
        <div className="container">
          <p>&copy; 2024 Sportisiaro. Toate drepturile rezervate.</p>
        </div>
      </footer>

      <MoreFilters
        isOpen={showMoreFilters}
        onClose={() => setShowMoreFilters(false)}
        filters={advancedFilters}
        onApplyFilters={handleApplyAdvancedFilters}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

