'use client';

import Link from 'next/link';
import { SportsField, Coach } from '@/lib/types';

interface HorizontalCardProps {
  item: SportsField | Coach;
  type: 'field' | 'coach';
  getSportLabel: (sport: string) => string;
}

export default function HorizontalCard({ item, type, getSportLabel }: HorizontalCardProps) {
  const isField = type === 'field';
  const field = isField ? item as SportsField : null;
  const coach = !isField ? item as Coach : null;

  const imageUrl = field?.imageUrl || coach?.imageUrl;
  const name = field?.name || coach?.name || '';
  const sport = field?.type || coach?.sport || '';
  const location = field 
    ? `${field.location}, ${field.city}` 
    : (coach?.location ? `${coach.city}, ${coach.location}` : coach?.city || '');
  const price = field?.pricePerHour || coach?.pricePerHour;
  const description = field?.description || coach?.description;
  const experience = coach?.experience;
  const detailUrl = isField && field ? `/field/${field.id}` : (coach ? `/coach/${coach.id}` : '#');
  const contactName = field?.contactName || coach?.contactName || '';
  const contactPhone = field?.contactPhone || coach?.contactPhone || '';

  return (
    <Link href={detailUrl}>
      <div className="card" style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '24px',
        padding: '0',
        overflow: 'hidden',
        cursor: 'pointer'
      }}>
        {/* Image Section */}
        <div style={{
          width: '200px',
          minWidth: '200px',
          height: '200px',
          backgroundColor: '#e5e7eb',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.style.background = 'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)';
                target.parentElement!.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white; font-size: 48px;">${sport === 'tenis' ? '🎾' : sport === 'fotbal' ? '⚽' : sport === 'baschet' ? '🏀' : sport === 'volei' ? '🏐' : '🏟️'}</div>`;
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '48px'
            }}>
              {sport === 'tenis' ? '🎾' : sport === 'fotbal' ? '⚽' : sport === 'baschet' ? '🏀' : sport === 'volei' ? '🏐' : '🏟️'}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div style={{
          flex: 1,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="badge badge-primary" style={{ fontSize: '13px' }}>
                {getSportLabel(sport || '')} {type === 'coach' ? 'coach' : ''}
              </span>
            </div>

            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '4px'
            }}>
              {name}
            </h3>

            {type === 'coach' && experience && (
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '12px',
                fontStyle: 'italic'
              }}>
                {experience}
              </p>
            )}

            <p style={{
              fontSize: '15px',
              color: '#6b7280',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              📍 {location}
            </p>

            {description && (
              <p style={{
                fontSize: '14px',
                color: '#374151',
                lineHeight: '1.6',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                marginBottom: '12px'
              }}>
                {description}
              </p>
            )}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            paddingTop: '16px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <div>
              {contactName && (
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                  Contact: {contactName}
                </p>
              )}
              {contactPhone && (
                <p style={{ fontSize: '13px', color: '#6b7280' }}>
                  📞 {contactPhone}
                </p>
              )}
            </div>
            {price !== undefined && price !== null && (
              <div style={{
                textAlign: 'right'
              }}>
                <p style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#2563eb',
                  marginBottom: '2px'
                }}>
                  From {price} RON
                </p>
                <p style={{
                  fontSize: '13px',
                  color: '#6b7280'
                }}>
                  / {type === 'coach' ? 'lecție' : 'oră'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

