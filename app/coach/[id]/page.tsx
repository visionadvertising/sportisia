'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Coach } from '@/lib/types';
import ToastContainer from '@/components/ToastContainer';
import { useToast } from '@/hooks/useToast';

export default function CoachDetails() {
  const params = useParams();
  const router = useRouter();
  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toasts, removeToast, success, error: showError } = useToast();

  useEffect(() => {
    if (params.id) {
      fetchCoach(params.id as string);
    }
  }, [params.id]);

  const fetchCoach = async (id: string) => {
    try {
      const response = await fetch(`/api/coaches/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCoach(data);
      } else {
        router.push('/coaches');
      }
    } catch (error) {
      console.error('Error fetching coach:', error);
      router.push('/coaches');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!coach) return;

    try {
      const response = await fetch(`/api/coaches/${coach.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        success('Antrenorul a fost șters cu succes!');
        setTimeout(() => {
          router.push('/coaches');
        }, 500);
      } else {
        showError('Eroare la ștergerea antrenorului');
      }
    } catch (error) {
      console.error('Error deleting coach:', error);
      showError('Eroare la ștergerea antrenorului. Verifică conexiunea la internet.');
    }
  };

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

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <p>Se încarcă...</p>
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <p>Antrenorul nu a fost găsit.</p>
        <Link href="/coaches" className="btn btn-primary" style={{ marginTop: '20px', background: '#0d9488' }}>
          Înapoi la listă
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, #0f766e 0%, #0891b2 50%, #0284c7 100%)',
        color: 'white',
        padding: '40px 0',
        marginBottom: '40px'
      }}>
        <div className="container">
          <Link href="/coaches" style={{ color: 'white', marginBottom: '16px', display: 'inline-block', opacity: 0.9 }}>
            ← Înapoi la listă
          </Link>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{coach.name}</h1>
        </div>
      </div>

      <div className="container">
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '300px' }}>
            <div className="card">
              {coach.imageUrl && (
                <div style={{
                  width: '100%',
                  height: '300px',
                  marginBottom: '20px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#e5e7eb'
                }}>
                  <img
                    src={coach.imageUrl}
                    alt={coach.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div style={{ marginBottom: '20px' }}>
                <span className="badge badge-primary" style={{ fontSize: '16px', padding: '8px 16px' }}>
                  {getSportLabel(coach.sport)}
                </span>
              </div>

              <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#111827' }}>
                {coach.name}
              </h2>

              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '8px' }}>
                  📍 <strong>Oraș:</strong> {coach.city}
                </p>
                {coach.location && (
                  <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '8px' }}>
                    🏢 <strong>Locație:</strong> {coach.location}
                  </p>
                )}
              </div>

              {coach.experience && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', color: '#111827' }}>
                    Experiență
                  </h3>
                  <p style={{ color: '#374151', lineHeight: '1.6' }}>
                    {coach.experience}
                  </p>
                </div>
              )}

              {coach.description && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', color: '#111827' }}>
                    Despre
                  </h3>
                  <p style={{ color: '#374151', lineHeight: '1.6' }}>
                    {coach.description}
                  </p>
                </div>
              )}

              {coach.qualifications && coach.qualifications.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', color: '#111827' }}>
                    Calificări
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {coach.qualifications.map((qualification, index) => (
                      <span key={index} className="badge">
                        {qualification}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {coach.pricePerHour && (
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>
                    Preț: {coach.pricePerHour} RON/oră
                  </p>
                </div>
              )}
            </div>
          </div>

          <div style={{ flex: '1', minWidth: '300px' }}>
            <div className="card">
              <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#111827' }}>
                Date de Contact
              </h3>

              <div style={{ marginBottom: '16px' }}>
                <p style={{ color: '#6b7280', marginBottom: '4px' }}>Nume contact:</p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                  {coach.contactName}
                </p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <p style={{ color: '#6b7280', marginBottom: '4px' }}>Telefon:</p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                  <a href={`tel:${coach.contactPhone}`} style={{ color: '#2563eb' }}>
                    {coach.contactPhone}
                  </a>
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <p style={{ color: '#6b7280', marginBottom: '4px' }}>Email:</p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                  <a href={`mailto:${coach.contactEmail}`} style={{ color: '#2563eb' }}>
                    {coach.contactEmail}
                  </a>
                </p>
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                flexDirection: 'column',
                marginTop: '30px',
                paddingTop: '24px',
                borderTop: '1px solid #e5e7eb'
              }}>
                <Link 
                  href={`/edit-coach/${coach.id}`} 
                  className="btn btn-primary"
                  style={{ width: '100%', background: '#0d9488' }}
                >
                  Editează Antrenor
                </Link>
                <button
                  className="btn btn-danger"
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{ width: '100%' }}
                >
                  Șterge Antrenor
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '400px', margin: '20px' }}>
            <h3 style={{ marginBottom: '16px', color: '#111827' }}>
              Confirmă ștergerea
            </h3>
            <p style={{ marginBottom: '24px', color: '#6b7280' }}>
              Ești sigur că vrei să ștergi acest antrenor? Această acțiune nu poate fi anulată.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
                style={{ flex: 1 }}
              >
                Anulează
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                style={{ flex: 1 }}
              >
                Șterge
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}


