import { useEffect, useState, type CSSProperties, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import API_BASE_URL from '../config'
import { slugify } from '../utils/seo'
import ProfileWizard from './register/ProfileWizard'

const PLANS = [
  { code: 'owner_monthly', name: 'Lunar', amount: 49, interval: 'lună', discountPercent: 0, compareAt: 0, note: 'Plătești în fiecare lună' },
  { code: 'owner_yearly', name: 'Anual', amount: 394, interval: 'an', discountPercent: 33, compareAt: 588, note: 'Echivalent 33 RON / lună' }
]

const REGISTER_TYPE_BY_SLUG: Record<string, string> = {
  'baze-sportive': 'field',
  antrenori: 'coach',
  'magazine-reparatii': 'repair_shop',
  'magazine-articole': 'equipment_shop'
}

type Step = 'start' | 'pay' | 'onboarding' | 'done'

interface ClaimData {
  id?: number
  facility_id: number
  facility_name?: string
  facility_type?: string
  city?: string
  status?: string
  username?: string
  amount?: number
  currency?: string
  paymentMode?: string
  plan?: { name: string; amount: number; currency: string; interval: string }
}

function ClaimFacility() {
  const { facilityId, claimId } = useParams<{ facilityId: string; claimId?: string }>()
  const routeLocation = useLocation()
  const navigate = useNavigate()
  const registerType = REGISTER_TYPE_BY_SLUG[routeLocation.pathname.split('/')[2]] || ''
  const isRegister = routeLocation.pathname.startsWith('/register/') && Boolean(registerType)
  const step: Step = window.location.pathname.includes('/completare')
    ? 'onboarding'
    : window.location.pathname.includes('/plata')
      ? 'pay'
      : 'start'
  const [isMobile, setIsMobile] = useState(window.innerWidth < 860)

  const [facilityName, setFacilityName] = useState('')
  const [facilityType, setFacilityType] = useState('field')
  const [city, setCity] = useState('')
  const [claim, setClaim] = useState<ClaimData | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [planCode, setPlanCode] = useState('owner_yearly')
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirm: '',
    isCompany: false,
    cui: '',
    billingAddress: ''
  })
  const [facilityRow, setFacilityRow] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 860)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const fillFromFacility = (row: Record<string, unknown>) => {
    setFacilityRow(row)
    setFacilityName(String(row.name || ''))
    setFacilityType(String(row.facility_type || 'field'))
    setCity(String(row.city || ''))
    const contact = String(row.contact_person || '').trim()
    const nameParts = contact.split(/\s+/).filter(Boolean)
    const storedPhone = String(row.phone || '')
    setForm((current) => ({
      ...current,
      firstName: current.firstName || nameParts[0] || '',
      lastName: current.lastName || nameParts.slice(1).join(' ') || '',
      email: current.email || String(row.email || ''),
      phone: current.phone || (storedPhone === '0000000000' ? '' : storedPhone)
    }))
  }

  useEffect(() => {
    const load = async () => {
      setPageLoading(true)
      if (isRegister && !claimId) {
        setFacilityType(registerType)
        setPageLoading(false)
        return
      }
      if (claimId) {
        const response = await fetch(`${API_BASE_URL}/claims/${claimId}`)
        const data = await response.json()
        if (!data.success) {
          setError(data.error || 'Revendicarea nu a fost găsită')
          setPageLoading(false)
          return
        }
        setClaim(data.data)
        setFacilityName(data.data.facility_name || '')
        setFacilityType(data.data.facility_type || 'field')
        setCity(data.data.city || '')
        if (data.data.plan_code) setPlanCode(data.data.plan_code)
        const facilityResponse = await fetch(`${API_BASE_URL}/facilities/${data.data.facility_id}`)
        const facilityData = await facilityResponse.json()
        if (facilityData.success && facilityData.data) fillFromFacility(facilityData.data)
        setPageLoading(false)
        return
      }

      if (!facilityId) {
        setPageLoading(false)
        return
      }
      const response = await fetch(`${API_BASE_URL}/facilities/${facilityId}`)
      const data = await response.json()
      if (data.success && data.data) {
        fillFromFacility(data.data)
        if (Number(data.data.is_verified) === 1) {
          setError('Această facilitate este deja verificată.')
        }
      } else {
        setError('Facilitatea nu a fost găsită.')
      }
      setPageLoading(false)
    }
    load().catch(() => {
      setError('Eroare la încărcare')
      setPageLoading(false)
    })
  }, [facilityId, claimId, isRegister, registerType])

  const selectedPlan = PLANS.find((plan) => plan.code === planCode) || PLANS[1]
  const planLocked = step === 'onboarding'
  const activeIndex = step === 'start' ? 0 : step === 'pay' ? 1 : 2
  const done = new URLSearchParams(window.location.search).get('done') === '1'
  const publicPath = facilityName
    ? (facilityType === 'field'
      ? `/baza-sportiva/${slugify(`${facilityName} ${city}`)}`
      : `/facility/${facilityId}/${slugify(facilityName)}`)
    : '/'

  const passwordRules = [
    { ok: form.password.length >= 9, label: 'Minim 9 caractere' },
    { ok: /[a-z]/.test(form.password), label: 'O literă mică' },
    { ok: /[A-Z]/.test(form.password), label: 'O literă mare' },
    { ok: /\d/.test(form.password), label: 'O cifră' },
    { ok: /[^A-Za-z0-9]/.test(form.password), label: 'Un caracter special' }
  ]
  const passwordReady = passwordRules.every((rule) => rule.ok)

  const startClaim = async (event: FormEvent) => {
    event.preventDefault()
    if (isRegister && (!facilityName.trim() || !city.trim())) {
      setError('Completează denumirea și orașul.')
      return
    }
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('Completează numele și prenumele.')
      return
    }
    if (!passwordReady) {
      setError('Parola nu îndeplinește toate condițiile.')
      return
    }
    if (form.password !== form.passwordConfirm) {
      setError('Parolele nu coincid.')
      return
    }
    if (form.isCompany) {
      const cui = form.cui.replace(/\s/g, '').toUpperCase()
      if (!/^(RO)?\d{2,10}$/.test(cui)) {
        setError('CUI invalid. Exemplu: RO12345678.')
        return
      }
      if (form.billingAddress.trim().length < 5) {
        setError('Completează adresa de facturare.')
        return
      }
    }
    setLoading(true)
    setError('')
    try {
      const response = await fetch(isRegister ? `${API_BASE_URL}/registrations` : `${API_BASE_URL}/facilities/${facilityId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerName: `${form.firstName.trim()} ${form.lastName.trim()}`,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email,
          phone: form.phone,
          password: form.password,
          planCode,
          isCompany: form.isCompany,
          cui: form.cui,
          billingAddress: form.billingAddress,
          facilityType: registerType || facilityType,
          facilityName: facilityName.trim(),
          city: city.trim()
        })
      })
      const data = await response.json()
      if (!data.success) {
        setError(data.error || 'Nu am putut porni revendicarea')
        return
      }
      const nextClaimId = data.data.claimId
      if (data.data.claimToken) sessionStorage.setItem(`claimToken:${nextClaimId}`, data.data.claimToken)
      const nextFacilityId = data.data.facilityId || facilityId
      const nextStep = data.data.status === 'paid' ? 'completare' : 'plata'
      navigate(`/revendica/${nextFacilityId}/${nextStep}/${nextClaimId}`)
    } catch {
      setError('Eroare la conectarea la server')
    } finally {
      setLoading(false)
    }
  }

  const simulatePayment = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE_URL}/claims/${claimId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulate: true, planCode })
      })
      const data = await response.json()
      if (!data.success) {
        setError(data.error || 'Plata simulată a eșuat')
        return
      }
      localStorage.setItem('user', JSON.stringify(data.data.user))
      if (data.data.token) localStorage.setItem('userToken', data.data.token)
      navigate(`/revendica/${facilityId}/completare/${claimId}`)
    } catch {
      setError('Eroare la conectarea la server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#f4f7f6', minHeight: '100vh', padding: isMobile ? '1.5rem 1rem 3rem' : '2rem 2rem 4rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 1.5rem', color: '#0f172a', fontSize: isMobile ? '1.75rem' : '2.15rem', letterSpacing: '-0.03em' }}>
          {isRegister ? 'Înregistrare' : 'Preia controlul asupra profilului'}{facilityName ? `: ${facilityName}` : ''}
        </h1>

        <ol style={{
          listStyle: 'none',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: '0.75rem',
          margin: '0 0 1.5rem',
          padding: 0
        }}>
          {['Date de contact', 'Abonament', 'Completează profilul'].map((label, index) => {
            const reached = index <= activeIndex
            return (
              <li key={label} style={{
                background: 'white',
                border: `1px solid ${reached ? '#a7f3d0' : '#e2e8f0'}`,
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'center'
              }}>
                <span style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: reached ? '#10b981' : '#f1f5f9',
                  color: reached ? 'white' : '#64748b',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  flexShrink: 0
                }}>{index + 1}</span>
                <span style={{ color: reached ? '#0f172a' : '#64748b', fontWeight: 600, fontSize: '0.95rem' }}>{label}</span>
              </li>
            )
          })}
        </ol>

        {step !== 'onboarding' && <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}>
          {[...PLANS].sort((a, b) => b.discountPercent - a.discountPercent).map((plan) => {
            const selected = plan.code === selectedPlan.code
            const yearly = plan.discountPercent > 0
            const monthlyEquivalent = yearly ? Math.round(plan.amount / 12) : plan.amount
            const saved = yearly ? plan.compareAt - plan.amount : 0
            return (
              <button
                key={plan.code}
                type="button"
                disabled={planLocked}
                onClick={() => setPlanCode(plan.code)}
                style={{
                  textAlign: 'left',
                  position: 'relative',
                  background: yearly ? '#0f172a' : 'white',
                  border: selected ? '2px solid #10b981' : '1px solid #e2e8f0',
                  borderRadius: '18px',
                  padding: '1.35rem 1.35rem 1.2rem',
                  cursor: planLocked ? 'default' : 'pointer',
                  boxShadow: yearly ? '0 18px 40px rgba(15, 23, 42, 0.22)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: yearly ? '#6ee7b7' : '#64748b', fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {yearly ? 'Cel mai avantajos' : 'Fără reducere'}
                  </span>
                  <span style={{
                    background: selected ? '#10b981' : yearly ? 'rgba(16,185,129,0.16)' : '#f1f5f9',
                    color: selected || yearly ? (selected ? 'white' : '#6ee7b7') : '#64748b',
                    borderRadius: '999px',
                    padding: '0.28rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    {selected ? 'Selectat' : yearly ? `−${plan.discountPercent}%` : plan.name}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: yearly ? 'white' : '#0f172a', marginBottom: '0.35rem' }}>
                    {yearly ? 'Plată anuală' : 'Plată lunară'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                    <span style={{ fontSize: yearly ? '2.6rem' : '2.15rem', fontWeight: 800, letterSpacing: '-0.04em', color: yearly ? 'white' : '#0f172a', lineHeight: 1 }}>{monthlyEquivalent}</span>
                    <span style={{ color: yearly ? '#cbd5e1' : '#64748b', fontWeight: 600 }}>RON / lună</span>
                  </div>
                </div>
                {yearly ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', color: '#cbd5e1', fontSize: '0.92rem' }}>
                    <span>Plătești {plan.amount} RON o dată pe an</span>
                    <span>
                      <span style={{ textDecoration: 'line-through', marginRight: '0.4rem' }}>{plan.compareAt} RON</span>
                      <span style={{ color: '#6ee7b7', fontWeight: 700 }}>Economisești {saved} RON</span>
                    </span>
                  </div>
                ) : (
                  <div style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.45 }}>
                    {plan.amount} RON în fiecare lună. Pe un an ajungi la {plan.amount * 12} RON, fără reducere.
                  </div>
                )}
              </button>
            )
          })}
        </div>}

        {error && (
          <div style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '0.9rem 1rem', borderRadius: '12px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div>
            {pageLoading ? (
              <section style={cardStyle}><p style={{ margin: 0, color: '#64748b' }}>Se încarcă profilul...</p></section>
            ) : step === 'start' && (
              <form onSubmit={startClaim} style={cardStyle}>
                <SectionTitle title={isRegister ? 'Contul tău' : 'Cine revendică'} />
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.85rem' }}>
                  <Field label="Denumire" value={facilityName} onChange={setFacilityName} placeholder="Arena Verde" />
                  <Field label="Oraș" value={city} onChange={setCity} placeholder="Cluj-Napoca" />
                  <Field label="Nume" value={form.firstName} onChange={(value) => setForm({ ...form, firstName: value })} placeholder="Andrei" />
                  <Field label="Prenume" value={form.lastName} onChange={(value) => setForm({ ...form, lastName: value })} placeholder="Popescu" />
                  <Field label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} placeholder="nume@email.ro" />
                  <Field label="Telefon" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} placeholder="07xx xxx xxx" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>Persoană juridică, factură pe firmă</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.isCompany}
                    onClick={() => setForm({ ...form, isCompany: !form.isCompany })}
                    style={{
                      width: '46px',
                      height: '26px',
                      borderRadius: '999px',
                      border: 'none',
                      background: form.isCompany ? '#10b981' : '#e2e8f0',
                      position: 'relative',
                      cursor: 'pointer',
                      flexShrink: 0,
                      padding: 0
                    }}
                  >
                    <span style={{
                      position: 'absolute',
                      top: '3px',
                      left: form.isCompany ? '23px' : '3px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'white',
                      transition: 'left 0.15s ease'
                    }} />
                  </button>
                </div>
                {form.isCompany && (
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '168px 1fr', gap: '0.85rem' }}>
                    <Field label="CUI" value={form.cui} onChange={(value) => setForm({ ...form, cui: value })} placeholder="RO12345678" />
                    <Field label="Adresă" value={form.billingAddress} onChange={(value) => setForm({ ...form, billingAddress: value })} placeholder="Strada, număr, oraș" />
                  </div>
                )}
                <div style={{ height: '1px', background: '#e2e8f0' }} />
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.85rem' }}>
                  <Field label="Parolă" type="password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} placeholder="Parola" />
                  <Field label="Repetă parola" type="password" value={form.passwordConfirm} onChange={(value) => setForm({ ...form, passwordConfirm: value })} placeholder="Repetă parola" />
                </div>
                {(form.password.length > 0 || form.passwordConfirm.length > 0) && (
                  <PasswordHints
                    isMobile={isMobile}
                    rules={[
                      ...passwordRules,
                      { ok: form.passwordConfirm.length > 0 && form.password === form.passwordConfirm, label: 'Parolele coincid' }
                    ]}
                  />
                )}
                <button type="submit" disabled={loading} style={primaryButton}>
                  {loading ? 'Se verifică...' : 'Continuă la abonament'}
                </button>
              </form>
            )}

            {step === 'pay' && (
              <section style={cardStyle}>
                <SectionTitle title="Abonament proprietar" text="Un singur profil, actualizări oricând din panou." />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.04em', color: '#0f172a', lineHeight: 1 }}>{selectedPlan.amount} RON</div>
                    <div style={{ color: '#64748b', marginTop: '0.35rem' }}>
                      {selectedPlan.discountPercent > 0 ? '12 luni, cu 33% reducere față de plata lunară' : 'Reînnoire în fiecare lună'}
                    </div>
                  </div>
                  <span style={{ background: '#ecfdf5', color: '#047857', borderRadius: '999px', padding: '0.35rem 0.7rem', fontWeight: 700, fontSize: '0.8rem' }}>Activ imediat</span>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.9rem 1rem', color: '#475569', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  Plata se face prin Netopia. Până la configurarea contului de comerciant, confirmarea este simulată și nu se emite o tranzacție reală.
                </div>
                <button type="button" onClick={simulatePayment} disabled={loading} style={primaryButton}>
                  {loading ? 'Se confirmă...' : 'Am plătit'}
                </button>
              </section>
            )}

            {step === 'onboarding' && !done && claim?.username && (
              <ProfileWizard
                type={facilityType}
                completion={{
                  claimId: String(claim.id || claimId),
                  username: claim.username,
                  facility: facilityRow || { name: facilityName, city, facility_type: facilityType },
                  onDone: () => navigate(`/revendica/${facilityId || claim.facility_id}/completare/${claim.id || claimId}?done=1`, { replace: true })
                }}
              />
            )}

            {step === 'onboarding' && !done && !claim?.username && (
              <section style={cardStyle}><p style={{ margin: 0, color: '#64748b' }}>Lipsește contul asociat revendicării.</p></section>
            )}

            {step === 'onboarding' && done && (
              <section style={cardStyle}>
                <p style={{ margin: 0, color: '#059669', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.8rem' }}>Gata</p>
                <h2 style={{ margin: 0, fontSize: '1.7rem', letterSpacing: '-0.03em' }}>Profilul este verificat</h2>
                <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>
                  {facilityName} apare acum cu badge-ul Verificat. Poți reveni oricând în panou ca să actualizezi prețurile, programul sau pozele.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Link to={publicPath} style={{ ...primaryButton, textDecoration: 'none' }}>Vezi profilul</Link>
                  <Link to="/dashboard" style={{ ...secondaryButton, textDecoration: 'none' }}>Deschide panoul</Link>
                </div>
              </section>
            )}
        </div>
      </div>
    </div>
  )
}

function PasswordHints({ rules, isMobile }: { rules: { ok: boolean; label: string }[]; isMobile: boolean }) {
  const passed = rules.filter((rule) => rule.ok).length
  const strength = passed <= 2 ? 'Slabă' : passed <= 4 ? 'Medie' : passed <= 5 ? 'Bună' : 'Puternică'
  const color = passed <= 2 ? '#dc2626' : passed <= 4 ? '#d97706' : '#059669'
  return (
    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.85rem 0.95rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Puterea parolei</span>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color }}>{strength}</span>
      </div>
      <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
        <div style={{ width: `${(passed / rules.length) * 100}%`, height: '100%', background: color, borderRadius: '999px', transition: 'width 0.2s ease' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.4rem 0.85rem' }}>
        {rules.map((rule) => (
          <span key={rule.label} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', fontWeight: 600, color: rule.ok ? '#047857' : '#94a3b8' }}>
            <span style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: rule.ok ? '#d1fae5' : '#eef2f6',
              color: rule.ok ? '#047857' : 'transparent',
              fontSize: '0.68rem',
              lineHeight: 1
            }}>{rule.ok ? '✓' : ''}</span>
            {rule.label}
          </span>
        ))}
      </div>
    </div>
  )
}

function SectionTitle({ title, text }: { title: string; text?: string }) {
  return (
    <div>
      <h2 style={{ margin: 0, fontSize: '1.15rem', letterSpacing: '-0.02em' }}>{title}</h2>
      {text && <p style={{ margin: '0.3rem 0 0', color: '#64748b', fontSize: '0.92rem', lineHeight: 1.5 }}>{text}</p>}
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder, required = true }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <label style={labelStyle}>{label}
      <input type={type} value={value} required={required && type !== 'number'} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} style={inputStyle} />
    </label>
  )
}

const cardStyle: CSSProperties = {
  background: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '16px',
  padding: '1.35rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'
}

const labelStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
  fontWeight: 600,
  color: '#0f172a',
  fontSize: '0.92rem'
}

const inputStyle: CSSProperties = {
  border: '1px solid #cbd5e1',
  borderRadius: '10px',
  padding: '0.75rem 0.85rem',
  font: 'inherit',
  fontWeight: 400,
  color: '#0f172a',
  background: 'white',
  width: '100%'
}

const primaryButton: CSSProperties = {
  background: '#059669',
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  padding: '0.9rem 1.1rem',
  fontWeight: 700,
  cursor: 'pointer',
  textAlign: 'center',
  fontSize: '1rem'
}

const secondaryButton: CSSProperties = {
  ...primaryButton,
  background: 'white',
  color: '#0f172a',
  border: '1px solid #cbd5e1'
}

export default ClaimFacility
