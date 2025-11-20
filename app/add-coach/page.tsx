'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ToastContainer from '@/components/ToastContainer';
import { useToast } from '@/hooks/useToast';
import { Coach } from '@/lib/types';

const sportTypes = [
  { value: 'tenis', label: 'Tenis' },
  { value: 'fotbal', label: 'Fotbal' },
  { value: 'baschet', label: 'Baschet' },
  { value: 'volei', label: 'Volei' },
  { value: 'handbal', label: 'Handbal' },
  { value: 'alte', label: 'Alte' },
];

const qualificationOptions = [
  'Licență antrenor',
  'Diplomă universitară',
  'Certificat internațional',
  'Experiență competițională',
  'Specializare tehnică',
  'Prim ajutor',
];

export default function AddCoach() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toasts, removeToast, success, error: showError } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    sport: 'tenis',
    city: '',
    location: '',
    description: '',
    experience: '',
    qualifications: [] as string[],
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    pricePerHour: '',
    imageUrl: '',
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Numele antrenorului este obligatoriu';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Orașul este obligatoriu';
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Numele de contact este obligatoriu';
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Telefonul este obligatoriu';
    } else if (!/^[0-9+\s()-]+$/.test(formData.contactPhone)) {
      newErrors.contactPhone = 'Format telefon invalid';
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Email-ul este obligatoriu';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Format email invalid';
    }

    if (formData.pricePerHour && isNaN(parseFloat(formData.pricePerHour))) {
      newErrors.pricePerHour = 'Prețul trebuie să fie un număr valid';
    }

    if (formData.imageUrl && !/^https?:\/\/.+/.test(formData.imageUrl)) {
      newErrors.imageUrl = 'URL-ul imaginii trebuie să înceapă cu http:// sau https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/coaches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          pricePerHour: formData.pricePerHour ? parseFloat(formData.pricePerHour) : undefined,
        }),
      });

      if (response.ok) {
        const coach = await response.json();
        success('Antrenorul a fost adăugat cu succes!');
        setTimeout(() => {
          router.push(`/coach/${coach.id}`);
        }, 500);
      } else {
        const errorData = await response.json().catch(() => ({}));
        showError(errorData.error || 'Eroare la adăugarea antrenorului');
      }
    } catch (error) {
      console.error('Error adding coach:', error);
      showError('Eroare la adăugarea antrenorului. Verifică conexiunea la internet.');
    } finally {
      setLoading(false);
    }
  };

  const handleQualificationChange = (qualification: string) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.includes(qualification)
        ? prev.qualifications.filter(q => q !== qualification)
        : [...prev.qualifications, qualification],
    }));
  };

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
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Adaugă Antrenor</h1>
        </div>
      </div>

      <div className="container">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Nume antrenor *</label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  placeholder="ex: Ion Popescu"
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="sport">Sport *</label>
                <select
                  id="sport"
                  required
                  value={formData.sport}
                  onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                >
                  {sportTypes.map(sport => (
                    <option key={sport.value} value={sport.value}>
                      {sport.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label htmlFor="city">Oraș *</label>
                  <select
                    id="city"
                    required
                    value={formData.city}
                    onChange={(e) => {
                      setFormData({ ...formData, city: e.target.value });
                      if (errors.city) setErrors({ ...errors, city: '' });
                    }}
                    className={errors.city ? 'error' : ''}
                  >
                    <option value="">Selectează orașul</option>
                    {require('@/lib/cities').ROMANIAN_CITIES.map((city: string) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  {errors.city && <span style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px', display: 'block' }}>{errors.city}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="location">Locație (opțional)</label>
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="ex: Centru sau teren specific"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="experience">Experiență</label>
                <textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="ex: 10 ani de experiență, fost jucător profesionist..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Descriere</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrie stilul de antrenament, specializări, etc..."
                />
              </div>

              <div className="form-group">
                <label>Calificări</label>
                <div className="checkbox-group">
                  {qualificationOptions.map(qualification => (
                    <div key={qualification} className="checkbox-item">
                      <input
                        type="checkbox"
                        id={`qualification-${qualification}`}
                        checked={formData.qualifications.includes(qualification)}
                        onChange={() => handleQualificationChange(qualification)}
                      />
                      <label htmlFor={`qualification-${qualification}`} style={{ margin: 0, fontWeight: 'normal' }}>
                        {qualification}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="pricePerHour">Preț pe oră (RON)</label>
                <input
                  type="number"
                  id="pricePerHour"
                  value={formData.pricePerHour}
                  onChange={(e) => {
                    setFormData({ ...formData, pricePerHour: e.target.value });
                    if (errors.pricePerHour) setErrors({ ...errors, pricePerHour: '' });
                  }}
                  placeholder="ex: 100"
                  min="0"
                  step="0.01"
                  className={errors.pricePerHour ? 'error' : ''}
                />
                {errors.pricePerHour && <span style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px', display: 'block' }}>{errors.pricePerHour}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="imageUrl">URL imagine</label>
                <input
                  type="url"
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, imageUrl: e.target.value });
                    if (errors.imageUrl) setErrors({ ...errors, imageUrl: '' });
                  }}
                  placeholder="https://example.com/image.jpg"
                  className={errors.imageUrl ? 'error' : ''}
                />
                {errors.imageUrl && <span style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px', display: 'block' }}>{errors.imageUrl}</span>}
              </div>

              <h3 style={{ marginTop: '30px', marginBottom: '20px', color: '#111827' }}>
                Date de Contact
              </h3>

              <div className="form-group">
                <label htmlFor="contactName">Nume contact *</label>
                <input
                  type="text"
                  id="contactName"
                  required
                  value={formData.contactName}
                  onChange={(e) => {
                    setFormData({ ...formData, contactName: e.target.value });
                    if (errors.contactName) setErrors({ ...errors, contactName: '' });
                  }}
                  placeholder="ex: Ion Popescu"
                  className={errors.contactName ? 'error' : ''}
                />
                {errors.contactName && <span style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px', display: 'block' }}>{errors.contactName}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label htmlFor="contactPhone">Telefon *</label>
                  <input
                    type="tel"
                    id="contactPhone"
                    required
                    value={formData.contactPhone}
                    onChange={(e) => {
                      setFormData({ ...formData, contactPhone: e.target.value });
                      if (errors.contactPhone) setErrors({ ...errors, contactPhone: '' });
                    }}
                    placeholder="ex: 0712345678"
                    className={errors.contactPhone ? 'error' : ''}
                  />
                  {errors.contactPhone && <span style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px', display: 'block' }}>{errors.contactPhone}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="contactEmail">Email *</label>
                  <input
                    type="email"
                    id="contactEmail"
                    required
                    value={formData.contactEmail}
                    onChange={(e) => {
                      setFormData({ ...formData, contactEmail: e.target.value });
                      if (errors.contactEmail) setErrors({ ...errors, contactEmail: '' });
                    }}
                    placeholder="ex: contact@example.com"
                    className={errors.contactEmail ? 'error' : ''}
                  />
                  {errors.contactEmail && <span style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px', display: 'block' }}>{errors.contactEmail}</span>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                <Link href="/coaches" className="btn btn-secondary" style={{ flex: 1 }}>
                  Anulează
                </Link>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, background: '#0d9488' }}
                  disabled={loading}
                >
                  {loading ? 'Se salvează...' : 'Adaugă Antrenor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

