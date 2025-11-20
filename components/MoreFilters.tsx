'use client';

import { useState } from 'react';

interface MoreFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    minPrice?: number;
    maxPrice?: number;
    amenities: string[];
    city?: string;
  };
  onApplyFilters: (filters: {
    minPrice?: number;
    maxPrice?: number;
    amenities: string[];
    city?: string;
  }) => void;
}

const amenitiesOptions = [
  'Vestiar',
  'Dusuri',
  'Parcare',
  'Iluminat',
  'Restaurant/Cafenea',
  'Echipament inclus',
  'WiFi',
  'Aer condiționat',
];

export default function MoreFilters({ isOpen, onClose, filters, onApplyFilters }: MoreFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  if (!isOpen) return null;

  const handleAmenityToggle = (amenity: string) => {
    setLocalFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      minPrice: undefined,
      maxPrice: undefined,
      amenities: [],
      city: '',
    };
    setLocalFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 2000,
        }}
        onClick={onClose}
      />
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        zIndex: 2001,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '1.5rem', color: '#111827' }}>Filtre avansate</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Preț (RON/oră)
            </label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input
                type="number"
                placeholder="Min"
                value={localFilters.minPrice || ''}
                onChange={(e) => setLocalFilters({
                  ...localFilters,
                  minPrice: e.target.value ? parseFloat(e.target.value) : undefined
                })}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '15px'
                }}
              />
              <span style={{ color: '#6b7280' }}>—</span>
              <input
                type="number"
                placeholder="Max"
                value={localFilters.maxPrice || ''}
                onChange={(e) => setLocalFilters({
                  ...localFilters,
                  maxPrice: e.target.value ? parseFloat(e.target.value) : undefined
                })}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '15px'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Oraș
            </label>
            <input
              type="text"
              placeholder="Filtrează după oraș"
              value={localFilters.city || ''}
              onChange={(e) => setLocalFilters({
                ...localFilters,
                city: e.target.value
              })}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '15px'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '12px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Facilități
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px'
            }}>
              {amenitiesOptions.map(amenity => (
                <label
                  key={amenity}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '6px',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <input
                    type="checkbox"
                    checked={localFilters.amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px', color: '#374151' }}>{amenity}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
            onClick={handleReset}
            className="btn btn-secondary"
            style={{ flex: 1 }}
          >
            Resetează
          </button>
          <button
            onClick={handleApply}
            className="btn btn-primary"
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #0f766e 0%, #0891b2 100%)'
            }}
          >
            Aplică filtre
          </button>
        </div>
      </div>
    </>
  );
}


