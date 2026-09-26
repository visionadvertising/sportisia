import { Link } from 'react-router-dom'
import { COMPANY } from './company'
import LegalLayout, { Section, Subsection } from './LegalLayout'

export default function Privacy() {
  return (
    <LegalLayout
      title="Politica de confidențialitate"
      description="Informare GDPR despre datele prelucrate de INSPISERZ SRL pe Sportisia: scopuri, temeiuri, durate și drepturi."
      path="/politica-de-confidentialitate"
    >
      <p>
        Această informare este făcută potrivit art. 13 și, unde datele nu vin direct de la tine, art. 14 din Regulamentul (UE) 2016/679 (GDPR). Se aplică site-ului {COMPANY.site}.
      </p>

      <Section title="1. Operatorul">
        <p>
          Operatorul este <strong>{COMPANY.name}</strong>, CUI {COMPANY.cui}, {COMPANY.reg}, EUID {COMPANY.euid}, sediul în {COMPANY.address}.
        </p>
        <p>
          Pentru orice cerere despre datele tale scrie la <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>. Nu am desemnat un responsabil cu protecția datelor, pentru că activitatea nu intră în cazurile în care legea obligă la această desemnare. Poți folosi aceeași adresă de email.
        </p>
      </Section>

      <Section title="2. Ce date prelucrăm">
        <Subsection title="Cont și revendicare">
          <p>Nume, email, telefon, nume de utilizator, parola stocată criptat, iar dacă bifezi persoană juridică: CUI și adresă de facturare. Mai păstrăm planul ales, suma, moneda, statusul plății, referința plății și datele la care s-a creat sau s-a plătit contul.</p>
        </Subsection>
        <Subsection title="Profilul public">
          <p>Denumirea, tipul de activitate, orașul, adresa, coordonatele de pe hartă, telefoanele, numerele de WhatsApp, emailurile de contact, persoana de contact, descrierea, programul, prețurile, sporturile sau categoriile, logo-ul, galeria și linkurile către rețelele tale. Ce marchezi ca public este vizibil oricui deschide profilul.</p>
        </Subsection>
        <Subsection title="Comentarii">
          <p>Numele afișat, emailul, textul, nota opțională de la 1 la 5, legătura cu articolul și, la un răspuns, comentariul la care răspunzi, plus data și statusul de moderare. Pe site se văd numele, textul și nota. Emailul rămâne la noi.</p>
        </Subsection>
        <Subsection title="Contact și sugestii">
          <p>La contact: nume, email, subiect și mesaj. La sugestia unei facilități: denumire, județ, oraș și adresă. Sugestia nu îți cere un cont.</p>
        </Subsection>
        <Subsection title="Date tehnice">
          <p>Adresa IP este folosită în memoria serverului, pentru scurt timp, ca să limităm încercările repetate la autentificare, formulare și căutare pe hartă. Serverul web poate păstra jurnale tehnice cu IP, pagină și dată, pentru securitate. În browser păstrăm sesiunea și alegerea de cookies, descrise în <Link to="/politica-cookies">Politica de cookies</Link>.</p>
        </Subsection>
      </Section>

      <Section title="3. De unde vin datele">
        <p>
          Cele mai multe date ni le dai tu, în formulare. Unele profiluri există în director înainte să le revendice titularul, pentru că au fost sugerate sau introduse ca listare. În acel caz, datele sunt de regulă denumirea activității, localitatea și adresa. Dacă profilul privește o persoană fizică, de exemplu un antrenor, iar noi nu ți-am putut înmâna această informare în momentul colectării, o primești cel târziu când te contactăm sau când profilul este revendicat.
        </p>
      </Section>

      <Section title="4. Scopuri și temeiuri">
        <Subsection title="Cont, profil și abonament">
          <p>Creăm contul, publicăm profilul și ținem perioada plătită. Temeiul este executarea contractului sau demersurile înainte de contract, la cererea ta (art. 6 alin. 1 lit. b GDPR).</p>
        </Subsection>
        <Subsection title="Plăți și evidențe">
          <p>Confirmăm plata, păstrăm referința și documentele contabile. Temeiul este contractul și obligația legală contabilă și fiscală (art. 6 alin. 1 lit. b și lit. c). Numărul cardului este prelucrat de NETOPIA Payments, nu de noi.</p>
        </Subsection>
        <Subsection title="Comentarii și mesaje">
          <p>Publicăm comentariul aprobat pentru că ni l-ai trimis în acest scop. Emailul din comentariu și mesajele de contact sunt folosite ca să moderăm și să răspundem. Temeiul este cererea ta (lit. b) și interesul legitim de a ține un spațiu public fără abuzuri (lit. f). La echilibrul acestui interes am ținut cont că emailul nu se afișează și că poți cere ștergerea.</p>
        </Subsection>
        <Subsection title="Securitate">
          <p>Limităm cererile automate și investigăm accesul neautorizat. Temeiul este interesul legitim de a proteja site-ul, conturile și vizitatorii (lit. f). Contoarele de limitare stau doar în memorie, pe durata ferestrei de limitare, care nu depășește o oră.</p>
        </Subsection>
        <Subsection title="Cookies opționale">
          <p>Categoriile funcționale, de statistici și de marketing se pornesc doar pe baza consimțământului (lit. a), pe care îl poți retrage. Detaliile sunt în politica de cookies. La data acestui document, site-ul nu încarcă servicii de analiză sau de reclame. Alegerea ta este păstrată ca aceste servicii să nu pornească fără acord, dacă vor fi adăugate.</p>
        </Subsection>
        <Subsection title="Hărți">
          <p>Ca să arătăm o locație, adresa sau coordonatele căutate sunt trimise către Nominatim (OpenStreetMap), iar harta încarcă dale de la serverele OpenStreetMap. Temeiul este interesul legitim de a afișa directorul pe hartă și, când tu cauți o adresă în formular, executarea cererii tale. OpenStreetMap poate vedea adresa IP din acea conexiune.</p>
        </Subsection>
      </Section>

      <Section title="5. Cui îi transmitem datele">
        <p>Nu vindem datele și nu le folosim pentru publicitatea altor firme. Le văd doar:</p>
        <ul>
          <li>vizitatorii, pentru datele pe care le-ai făcut publice în profil și pentru comentariile aprobate;</li>
          <li>furnizorul care găzduiește site-ul și baza de date, ca persoană împuternicită, pe instrucțiunile noastre;</li>
          <li>serverul de email configurat de noi, când îți răspundem sau când primești un mesaj legat de cont;</li>
          <li>NETOPIA Payments, când plătești cu cardul, pentru efectuarea plății;</li>
          <li>OpenStreetMap Foundation, pentru căutarea adresei și afișarea hărții;</li>
          <li>autorități, când legea ne obligă sau când este necesar ca să apărăm un drept.</li>
        </ul>
        <p>
          Distribuirea pe WhatsApp, Facebook sau X are loc doar dacă apeși butonul. Atunci acel serviciu primește adresa paginii, potrivit propriilor lui reguli. Nu introducem scripturile lor în Sportisia.
        </p>
      </Section>

      <Section title="6. Transferuri în afara Uniunii Europene">
        <p>
          Găzduirea și baza de date sunt folosite pentru operarea site-ului. OpenStreetMap poate prelucra cererea de hartă și în afara României. Fundația care îl operează este înregistrată în Regatul Unit, acoperit de o decizie de adecvare a Comisiei Europene atât timp cât decizia este în vigoare. Dacă un furnizor pe care îl alegem ulterior prelucrează date în afara Spațiului Economic European, transferul se face doar cu o decizie de adecvare, cu clauze contractuale standard sau cu o altă garanție prevăzută de GDPR. Nu transferăm date către o țară terță pentru statistici sau marketing fără acordul tău pentru acea categorie.
        </p>
      </Section>

      <Section title="7. Cât timp le păstrăm">
        <ul>
          <li>Contul și profilul: cât timp contul este activ. După cererea de ștergere, le ștergem sau le anonimizăm, cu excepția a ceea ce trebuie păstrat prin lege.</li>
          <li>Revendicări începute și neplătite: cel mult 12 luni de la ultima actualizare, apoi le ștergem sau le anonimizăm.</li>
          <li>Documente de plată și evidențe contabile: pe durata prevăzută de legea contabilă și fiscală, în prezent de regulă 5 ani de la încheierea exercițiului, sau termenul mai lung dacă legea îl cere.</li>
          <li>Mesaje de contact: cel mult 24 de luni.</li>
          <li>Comentarii respinse: cel mult 12 luni. Comentarii aprobate: cât timp articolul este publicat, sau mai devreme dacă ceri ștergerea și nu există un motiv întemeiat să le păstrăm.</li>
          <li>Sugestii: până la soluționare și apoi cel mult 12 luni.</li>
          <li>Jurnale tehnice de server: cel mult 12 luni.</li>
          <li>Limitarea cererilor după IP: doar pe durata ferestrei, cel mult o oră, în memoria serverului.</li>
          <li>Alegerea de cookies: 6 luni în browserul tău, apoi te întrebăm din nou.</li>
          <li>Sesiunea de proprietar: 14 zile. Sesiunea de administrator: 12 ore. Cheia de revendicare: până închizi browserul.</li>
        </ul>
      </Section>

      <Section title="8. Ești obligat să ni le dai?">
        <p>
          Poți naviga în director fără cont. Numele, emailul, telefonul și parola sunt necesare ca să îți faci cont. Datele de facturare sunt necesare dacă vrei factură pe persoană juridică. Fără ele nu putem încheia abonamentul. Comentariul are nevoie de nume, email și text. Restul câmpurilor din profil sunt necesare doar dacă vrei să apară acea informație.
        </p>
      </Section>

      <Section title="9. Decizii automate">
        <p>
          Nu luăm decizii bazate exclusiv pe prelucrare automată care să producă efecte juridice asupra ta sau care să te afecteze în mod similar semnificativ. Badge-ul de profil activ arată că perioada plătită este în curs. Nu este un profilaj al vizitatorilor și nu îți stabilește un preț personalizat.
        </p>
      </Section>

      <Section title="10. Copii">
        <p>
          Site-ul nu este destinat copiilor sub 16 ani și nu cerem cu bună știință datele lor. Un cont cu plată poate fi deschis doar de o persoană de cel puțin 18 ani. Dacă aflăm că am colectat date de la un copil fără un temei, le ștergem. Ne poți scrie la {COMPANY.email}.
        </p>
      </Section>

      <Section title="11. Securitate">
        <p>
          Folosim conexiune criptată (HTTPS) pe site-ul public, parole stocate criptat, jetoane de sesiune cu termen limitat și acces de administrator separat. Nicio metodă de pe internet nu este lipsită de risc. Dacă aflăm de o încălcare care îți creează un risc ridicat, te informăm când GDPR o cere și anunțăm autoritatea.
        </p>
      </Section>

      <Section title="12. Drepturile tale">
        <p>Ne poți cere, în limitele GDPR:</p>
        <ul>
          <li>accesul la date și o copie;</li>
          <li>corectarea datelor inexacte;</li>
          <li>ștergerea, când datele nu mai sunt necesare, ți-ai retras consimțământul, te opui și nu există un motiv prioritar, sau prelucrarea este ilegală;</li>
          <li>restricționarea, în cazurile prevăzute de art. 18;</li>
          <li>portabilitatea datelor pe care ni le-ai dat și pe care le prelucrăm prin mijloace automate, în temeiul contractului sau al consimțământului;</li>
          <li>opoziția față de prelucrarea întemeiată pe interes legitim, din motive care țin de situația ta; ne oprim, dacă nu avem un motiv legitim prioritar;</li>
          <li>retrage oricând consimțământul pentru cookies opționale, fără să afecteze prelucrarea făcută înainte de retragere;</li>
          <li>să nu faci obiectul unei decizii automate de tipul celor de la art. 22; nu aplicăm astfel de decizii.</li>
        </ul>
        <p>
          Cererea se trimite la {COMPANY.email}. Putem cere o informație minimă ca să verificăm că ești titularul, înainte să îți dăm copia. Răspundem în cel mult o lună. Dacă cererea este complexă, putem prelungi cu încă două luni și îți spunem acest lucru în prima lună. Accesul, corectarea, ștergerea și celelalte drepturi de mai sus sunt gratuite. Putem refuza sau taxa doar cererile vădit nefondate sau repetate, așa cum permite art. 12.
        </p>
        <p>
          Ai dreptul să depui plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal, B-dul G-ral. Gheorghe Magheru 28-30, Sector 1, București, <a href={COMPANY.anspdcp} target="_blank" rel="noopener noreferrer">dataprotection.ro</a>. Poți și sesiza instanța.
        </p>
      </Section>

      <Section title="13. Actualizări">
        <p>
          Dacă schimbăm scopurile sau categoriile de date, actualizăm această pagină și data din antet. Pentru o schimbare care cere un nou consimțământ, îl cerem separat. Versiunea afișată pe site este cea în vigoare.
        </p>
      </Section>
    </LegalLayout>
  )
}
