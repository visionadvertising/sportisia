import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API_BASE_URL from '../config'
import FacilityResults, { type ResultFacility } from '../components/FacilityResults'
import { isMemberSession } from '../utils/memberSession'
import { readSavedIds, refreshMemberSavedIds } from '../utils/savedFacilities'
import { card, colors, column, contentBand, hero, heroOverlay, heroTitle, pageShell } from '../ui/theme'

export default function SavedFacilities() {
  const navigate = useNavigate()
  const [facilities, setFacilities] = useState<ResultFacility[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800)

  const load = async () => {
    if (!isMemberSession()) {
      setFacilities([])
      setLoading(false)
      return
    }
    await refreshMemberSavedIds()
    const ids = readSavedIds()
    if (!ids.length) {
      setFacilities([])
      setLoading(false)
      return
    }
    fetch(`${API_BASE_URL}/facilities?ids=${ids.join(',')}&status=active`)
      .then((response) => response.json())
      .then((data) => setFacilities(data.success ? data.data : []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!isMemberSession()) {
      navigate('/login/membru?next=/salvate', { replace: true })
      return
    }
    load()
    const onResize = () => setIsMobile(window.innerWidth < 800)
    window.addEventListener('resize', onResize)
    window.addEventListener('sportisia-saved', load)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('sportisia-saved', load)
    }
  }, [navigate])

  return (
    <div style={pageShell}>
      <header style={hero}>
        <div style={heroOverlay} />
        <div style={{ ...column, textAlign: 'left' }}>
          <h1 style={{ ...heroTitle, textAlign: 'left' }}>Facilități favorite</h1>
          <p style={{ margin: '0.75rem 0 0', color: 'rgba(255,255,255,0.75)' }}>
            Lista ta personală, sincronizată cu contul sportiv.
          </p>
        </div>
      </header>
      <div style={contentBand}>
        <div style={column}>
          {loading ? <p style={{ color: colors.muted }}>Se încarcă...</p> : facilities.length === 0 ? (
            <p style={{ ...card, margin: 0, padding: '1.25rem 1.4rem', color: colors.muted }}>
              Nu ai salvat încă nicio facilitate.{' '}
              <Link to="/terenuri" style={{ color: colors.greenDark, fontWeight: 700, textDecoration: 'none' }}>
                Vezi terenurile
              </Link>
            </p>
          ) : (
            <FacilityResults facilities={facilities} isMobile={isMobile} />
          )}
        </div>
      </div>
    </div>
  )
}
