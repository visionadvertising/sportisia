'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ToastContainer from '@/components/ToastContainer';
import { useToast } from '@/hooks/useToast';

const fieldTypes = [
  { value: 'tenis', label: 'Tenis' },
  { value: 'fotbal', label: 'Fotbal' },
  { value: 'baschet', label: 'Baschet' },
  { value: 'volei', label: 'Volei' },
  { value: 'handbal', label: 'Handbal' },
  { value: 'alte', label: 'Alte' },
];

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

export default function AddField() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toasts, removeToast, success, error: showError } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    type: 'tenis',
    location: '',
    city: '',
    description: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    amenities: [] as string[],
    pricePerHour: '',
    imageUrl: '',
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Numele terenului este obligatoriu';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Adresa este obligatorie';
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
      // Creează un AbortController pentru timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secunde timeout

      const response = await fetch('/api/fields', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          pricePerHour: formData.pricePerHour ? parseFloat(formData.pricePerHour) : undefined,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const field = await response.json();
        success('Terenul a fost adăugat cu succes!');
        setTimeout(() => {
          router.push(`/field/${field.id}`);
        }, 500);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || 'Eroare la adăugarea terenului';
        showError(errorMessage);
        console.error('Server error:', errorData);
      }
    } catch (error: any) {
      console.error('Error adding field:', error);
      if (error.name === 'AbortError') {
        showError('Request-ul a durat prea mult. Te rugăm să reîncerci.');
      } else {
        showError('Eroare la adăugarea terenului. Verifică conexiunea la internet sau încearcă din nou.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAmenityChange = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
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
          <Link href="/" style={{ color: 'white', marginBottom: '16px', display: 'inline-block', opacity: 0.9 }}>
            ← Înapoi la listă
          </Link>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Adaugă Teren Sportiv</h1>
        </div>
      </div>

      <div className="container">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Nume teren *</label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  placeholder="ex: Teren de Tenis Central"
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="type">Tip teren *</label>
                <select
                  id="type"
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  {fieldTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label htmlFor="location">Adresă *</label>
                  <input
                    type="text"
                    id="location"
                    required
                    value={formData.location}
                    onChange={(e) => {
                      setFormData({ ...formData, location: e.target.value });
                      if (errors.location) setErrors({ ...errors, location: '' });
                    }}
                    placeholder="ex: Str. Sportului nr. 10"
                    className={errors.location ? 'error' : ''}
                  />
                  {errors.location && <span style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px', display: 'block' }}>{errors.location}</span>}
                </div>

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
              </div>

              <div className="form-group">
                <label htmlFor="description">Descriere</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrie terenul, facilitățile, regulile..."
                />
              </div>

              <div className="form-group">
                <label>Facilități</label>
                <div className="checkbox-group">
                  {amenitiesOptions.map(amenity => (
                    <div key={amenity} className="checkbox-item">
                      <input
                        type="checkbox"
                        id={`amenity-${amenity}`}
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => handleAmenityChange(amenity)}
                      />
                      <label htmlFor={`amenity-${amenity}`} style={{ margin: 0, fontWeight: 'normal' }}>
                        {amenity}
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
                  placeholder="ex: 50"
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
                <Link href="/" className="btn btn-secondary" style={{ flex: 1 }}>
                  Anulează
                </Link>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={loading}
                >
                  {loading ? 'Se salvează...' : 'Adaugă Teren'}
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

