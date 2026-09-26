import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { COMPANY } from './company'
import LegalLayout, { Section, Subsection } from './LegalLayout'
import { openCookieSettings } from '../../components/CookieNotice'

const cell: CSSProperties = { borderBottom: '1px solid #eef2f6', padding: '0.55rem 0.45rem', verticalAlign: 'top', textAlign: 'left' }
const head: CSSProperties = { ...cell, color: '#0f172a', fontSize: '0.82rem' }

export default function Cookies() {
  return (
    <LegalLayout
      title="Politica de cookies"
      description="Informare despre cookies și stocarea similară pe Sportisia, temeiul legal, duratele și cum îți retragi acordul."
      path="/politica-cookies"
    >
      <p>
        Această politică explică tehnologiile folosite de {COMPANY.name} pe {COMPANY.site}, potrivit art. 4 din Legea nr. 506/2004 privind prelucrarea datelor cu caracter personal și protecția vieții private în sectorul comunicațiilor electronice și al art. 6 din GDPR. Completează <Link to="/politica-de-confidentialitate">Politica de confidențialitate</Link>.
      </p>
      <p>
        <button type="button" onClick={openCookieSettings} style={{ border: 0, background: '#10b981', color: 'white', borderRadius: '999px', padding: '0.6rem 1rem', fontWeight: 700, cursor: 'pointer' }}>
          Deschide setările de cookies
        </button>
      </p>

      <Section title="1. Ce acoperă această politică">
        <p>
          Pe lângă cookies în sens strict, folosim și stocare locală în browser (localStorage și sessionStorage). Legea le tratează la fel atunci când scriu sau citesc informații în terminalul tău. Mai jos le numim, împreună, „stocare”.
        </p>
        <p>
          Stocarea strict necesară ca să îți furnizăm un serviciu pe care l-ai cerut expres nu are nevoie de un acord separat. Orice altă stocare, inclusiv statistici și marketing, pornește doar după ce o accepți. Refuzul nu blochează căutarea în director și citirea paginilor.
        </p>
      </Section>

      <Section title="2. Cum îți cerem acordul">
        <p>
          La prima vizită, și apoi la fiecare 6 luni, apare o bandă cu trei opțiuni: să refuzi categoriile opționale, să le personalizezi sau să le accepți pe toate. Poți porni sau opri separat categoriile funcționale, de statistici și de marketing. Categoria necesară nu poate fi oprită, pentru că fără ea nu ținem sesiunea și nici alegerea făcută.
        </p>
        <p>
          Închiderea benzii fără o alegere nu înseamnă acceptare. Până alegi, categoriile opționale rămân oprite. Acordul este la fel de ușor de retras ca de dat: din „Setări cookies” din subsol sau din butonul de pe această pagină. Retragerea produce efecte din acel moment și nu afectează legalitatea stocării de dinainte.
        </p>
        <p>
          Alegerea se salvează doar în browserul tău, sub cheia <strong>sportisia-cookie-consent</strong>. Nu o vindem și nu o folosim ca să îți construim un profil publicitar.
        </p>
      </Section>

      <Section title="3. Categoriile">
        <Subsection title="Necesare">
          <p>Temeiul este furnizarea serviciului cerut de tine și excepția pentru stocarea strict necesară. Acestea sunt elementele folosite acum:</p>
          <div style={{ overflowX: 'auto', marginTop: '0.6rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  <th style={head}>Nume</th>
                  <th style={head}>Unde</th>
                  <th style={head}>Rol</th>
                  <th style={head}>Durată</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={cell}>sportisia-cookie-consent</td>
                  <td style={cell}>localStorage</td>
                  <td style={cell}>Reține categoriile acceptate sau refuzate, ca să nu te întrebăm la fiecare pagină.</td>
                  <td style={cell}>6 luni</td>
                </tr>
                <tr>
                  <td style={cell}>user, userToken</td>
                  <td style={cell}>localStorage</td>
                  <td style={cell}>Țin sesiunea proprietarului după autentificare.</td>
                  <td style={cell}>14 zile</td>
                </tr>
                <tr>
                  <td style={cell}>admin, adminToken</td>
                  <td style={cell}>localStorage</td>
                  <td style={cell}>Țin sesiunea de administrator. Nu se creează pentru vizitatori.</td>
                  <td style={cell}>12 ore</td>
                </tr>
                <tr>
                  <td style={cell}>claimToken:id</td>
                  <td style={cell}>sessionStorage</td>
                  <td style={cell}>Permite continuarea plății și a completării profilului în fereastra deschisă.</td>
                  <td style={cell}>Până închizi browserul</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Subsection>
        <Subsection title="Funcționale">
          <p>
            Sunt destinate preferințelor de afișare care nu sunt indispensabile. La data acestui document nu scriem o stocare separată pentru această categorie. Dacă o vom adăuga, va porni doar când comutatorul este pornit și va fi trecută în tabelul de mai sus.
          </p>
        </Subsection>
        <Subsection title="Statistici">
          <p>
            Ar măsura vizitele și paginile, ca să înțelegem ce este folosit. Nu includ reclame. La data acestui document nu este instalat niciun serviciu de analiză (inclusiv nu folosim Google Analytics). Nimic din această categorie nu se încarcă dacă o refuzi sau dacă nu ai ales încă.
          </p>
        </Subsection>
        <Subsection title="Marketing">
          <p>
            Ar acoperi conținut de la rețele sociale sau măsurarea campaniilor. La data acestui document nu încărcăm pixeli de publicitate. Butoanele de distribuire deschid WhatsApp, Facebook sau X doar după ce apeși tu și nu depun cookies de marketing în pagina Sportisia. Fără acord, nu vom încărca astfel de scripturi.
          </p>
        </Subsection>
      </Section>

      <Section title="4. Servicii terțe care pot vedea o conexiune">
        <p>
          Harta folosește dale de la OpenStreetMap și, când cauți o adresă, serviciul Nominatim. Browserul tău se conectează la serverele lor, care pot vedea adresa IP și adresa căutată. Acest schimb este necesar ca să arătăm locul pe hartă. Nu controlăm politicile lor. Le poți citi la operatorul OpenStreetMap. Dacă nu vrei această conexiune, poți folosi listele și fișele fără să deschizi harta.
        </p>
        <p>
          Plata cu cardul, când este folosită, are loc la NETOPIA Payments. Pagina lor poate folosi propriile tehnologii strict necesare plății. Nu le folosim ca să te urmărim pe alte site-uri. Numărul cardului nu este salvat de Sportisia.
        </p>
      </Section>

      <Section title="5. Jurnale și identificatori">
        <p>
          Adresa IP poate apărea în jurnalele tehnice ale serverului, separat de cookies, pentru securitate. Durata este de cel mult 12 luni, așa cum este descris în politica de confidențialitate. Limitarea cererilor repetate ține IP-ul doar în memorie, cel mult o oră, și nu îl scrie într-un cookie.
        </p>
      </Section>

      <Section title="6. Cum le ștergi din browser">
        <p>
          Poți șterge cookies și datele site-ului din setările browserului. Poți și bloca stocarea locală. Dacă ștergi sesiunea, va trebui să te autentifici din nou. Dacă ștergi alegerea de cookies, banda apare iar la următoarea vizită, iar categoriile opționale rămân oprite până la o nouă alegere.
        </p>
        <p>
          Ghiduri ale producătorilor: setările de confidențialitate din Chrome, Firefox, Edge și Safari, secțiunea de cookies sau de date ale site-urilor. Blocarea stocării necesare poate opri autentificarea și continuarea unei revendicări.
        </p>
      </Section>

      <Section title="7. Durata acordului și actualizări">
        <p>
          Acordul sau refuzul pentru categoriile opționale expiră după 6 luni. Dacă adăugăm un serviciu nou într-o categorie, actualizăm această pagină înainte să îl încărcăm și, dacă scopul nu era acoperit de acordul deja dat, îți cerem din nou acordul. Data din antet este data versiunii.
        </p>
        <p>
          Întrebările se trimit la <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>. Drepturile GDPR, inclusiv plângerea către Autoritatea de supraveghere, sunt descrise în politica de confidențialitate.
        </p>
      </Section>
    </LegalLayout>
  )
}
