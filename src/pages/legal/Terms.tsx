import { Link } from 'react-router-dom'
import { COMPANY } from './company'
import LegalLayout, { Section, Subsection } from './LegalLayout'

export default function Terms() {
  return (
    <LegalLayout
      title="Termeni și condiții"
      description="Condițiile de folosire a platformei Sportisia, operată de INSPISERZ SRL, inclusiv conturi, abonamente și dreptul de retragere."
      path="/termeni-si-conditii"
    >
      <p>
        Acești termeni reglementează folosirea site-ului {COMPANY.site} și a serviciilor oferite sub numele {COMPANY.brand}. Te rugăm să îi citești înainte să îți faci cont, să publici un profil sau să plătești un abonament. Dacă nu ești de acord, nu folosi părțile din site care cer un cont.
      </p>

      <Section title="1. Cine oferă serviciul">
        <p>
          Serviciul este oferit de <strong>{COMPANY.name}</strong>, societate cu răspundere limitată, CUI {COMPANY.cui}, număr de ordine în registrul comerțului {COMPANY.reg}, EUID {COMPANY.euid}, cu sediul în {COMPANY.address}. Societatea este reprezentată legal de administratorul său.
        </p>
        <p>
          La data acestui document, societatea nu figurează ca plătitoare de TVA. Prețurile afișate în pagină sunt sumele pe care le plătești. Dacă situația de TVA se schimbă, prețul arătat înainte de comandă este cel care se aplică.
        </p>
        <p>
          Ne poți scrie la <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>. Datele despre prelucrarea informațiilor personale sunt în <Link to="/politica-de-confidentialitate">Politica de confidențialitate</Link>, iar regulile pentru stocarea din browser sunt în <Link to="/politica-cookies">Politica de cookies</Link>.
        </p>
      </Section>

      <Section title="2. Ce înseamnă termenii folosiți">
        <p><strong>Site-ul</strong> este directorul Sportisia: paginile publice, conturile, blogul și formularele.</p>
        <p><strong>Vizitator</strong> este orice persoană care deschide site-ul, inclusiv fără cont.</p>
        <p><strong>Proprietar</strong> este persoana care își face cont ca să publice sau să revendice un profil de bază sportivă, antrenor, magazin de reparații sau magazin de articole sportive.</p>
        <p><strong>Consumator</strong> este persoana fizică care folosește serviciul în afara activității sale comerciale sau profesionale, în sensul legii române.</p>
        <p><strong>Profesionist</strong> este persoana fizică autorizată sau persoana juridică care folosește serviciul pentru activitatea sa. Bifarea „persoană juridică” și completarea CUI înseamnă că acționezi în acest scop.</p>
        <p><strong>Profil</strong> este pagina publică a unei facilități, cu datele, pozele, programul și prețurile afișate.</p>
        <p><strong>Abonament</strong> este perioada plătită în avans, de o lună sau de un an, în care profilul poate purta badge-ul de profil activ.</p>
      </Section>

      <Section title="3. Acceptarea">
        <p>
          Deschiderea paginilor publice este permisă fără să accepți acești termeni, în limitele legii. Îți faci cont, trimiți un comentariu, un mesaj de contact, o sugestie sau o plată doar dacă accepți termenii. Comanda de abonament se face după ce prețul, durata și acești termeni îți sunt arătate.
        </p>
        <p>
          Dacă accepți în numele unei firme, confirmi că ai dreptul să o reprezinți. Pentru un contract cu plată trebuie să ai cel puțin 18 ani.
        </p>
      </Section>

      <Section title="4. Ce este Sportisia">
        <p>
          Sportisia este un director online. Vizitatorii caută baze sportive, antrenori și magazine. Proprietarii își prezintă activitatea: denumire, locație, contact, program, prețuri, descriere și fotografii.
        </p>
        <p>
          Nu suntem parte la rezervări, lecții, reparații, închirieri sau vânzări dintre un vizitator și un profil listat. Nu încasăm prețul terenului, al lecției sau al produsului. Nu garantăm că o facilitate este liberă, că un preț afișat este încă valabil sau că serviciul unui proprietar are un anumit rezultat.
        </p>
        <p>
          Informațiile din profil vin de la proprietar sau, înainte de revendicare, dintr-o sugestie ori din date deja introduse în director. Le poți verifica direct cu facilitatea.
        </p>
      </Section>

      <Section title="5. Contul de proprietar">
        <p>
          La înregistrare sau la revendicare cerem nume, email, telefon, un nume de utilizator și o parolă. Dacă bifezi persoană juridică, cerem și CUI-ul și adresa de facturare. Parola se stochează criptat, nu în clar.
        </p>
        <p>
          Ești responsabil să păstrezi parola și să ne anunți la {COMPANY.email} dacă bănuiești că altcineva a intrat în cont. Putem suspenda un cont folosit abuziv, cu date false sau cu încălcarea acestor termeni. Îți spunem motivul, în afară de cazul în care legea ne interzice sau amânarea este necesară ca să oprim o fraudă.
        </p>
        <p>
          Poți cere închiderea contului pe email. Închiderea nu șterge automat documentele pe care legea ne obligă să le păstrăm, cum sunt cele de plată. Detaliile sunt în politica de confidențialitate.
        </p>
      </Section>

      <Section title="6. Revendicarea și profilul public">
        <p>
          Poți revendica doar un profil pe care ai dreptul să îl reprezinți. Putem cere o dovadă (de exemplu legătura cu locația sau cu activitatea) dacă există un dubiu sau o reclamație. O revendicare falsă poate duce la anularea contului.
        </p>
        <p>
          Completezi profilul cu date reale: locație, telefoane, emailuri, program, prețuri, categorii și fotografii. Datele marcate ca publice, inclusiv telefonul și emailul de contact, sunt vizibile vizitatorilor. Nu publica datele personale ale altei persoane fără un temei.
        </p>
        <p>
          Prin publicare ne acorzi o licență neexclusivă, gratuită, valabilă în perioada în care profilul este online și pentru copiile de siguranță păstrate o perioadă limitată după ștergere, ca să afișăm, stocăm și redimensionăm materialele în director. Tu păstrezi drepturile asupra textelor și fotografiilor tale. Garanția pe care ne-o dai este că ai dreptul să le folosești și că nu încalcă legea sau drepturile altcuiva.
        </p>
        <p>
          Putem ascunde sau modifica formatul unui profil care este înșelător, ofensator, ilegal sau care încalcă drepturile unui terț. Când este rezonabil, te anunțăm și îți dăm posibilitatea să corectezi.
        </p>
      </Section>

      <Section title="7. Comentarii, contact și sugestii">
        <p>
          Comentariile de pe blog cer nume, email și text. Nota de la 1 la 5 stele este opțională și se aplică doar comentariului principal, nu răspunsurilor. Emailul nu se publică. Comentariul apare pe site doar după aprobare. Nu trimite reclame, date personale ale altor persoane, insulte sau conținut ilegal. Putem refuza sau șterge un comentariu care încalcă aceste reguli.
        </p>
        <p>
          Formularul de contact trimite numele, emailul, subiectul și mesajul către noi, ca să îți putem răspunde. Sugestia unei facilități conține denumirea, județul, orașul și adresa. Nu transforma sugestia într-un profil revendicat de tine dacă nu reprezinți acea facilitate.
        </p>
      </Section>

      <Section title="8. Preț, plată și durată">
        <p>
          Abonamentul de proprietar este, la data acestui document, <strong>49 RON pentru o lună</strong> sau <strong>394 RON pentru un an</strong>. Prețul aplicabil este cel afișat pe pagină în momentul comenzii, în RON. Nu există costuri ascunse de la noi pentru publicarea profilului.
        </p>
        <p>
          Plata acoperă perioada aleasă, începând de la confirmarea plății. Nu se reînnoiește singură și nu se debitează din nou cardul fără o comandă nouă. La sfârșitul perioadei, badge-ul legat de abonamentul activ încetează până la o nouă plată. Profilul poate rămâne vizibil, în forma disponibilă pentru profilurile fără abonament activ.
        </p>
        <p>
          Când plata cu cardul este activă, ea este procesată de NETOPIA Payments. Numărul cardului este introdus la procesator. Sportisia nu îl stochează. Păstrăm referința plății, suma, moneda, planul și statusul, ca să activăm perioada plătită și ca să ținem evidența cerută de lege.
        </p>
        <p>
          Dacă plata nu se confirmă, profilul nu primește beneficiile perioadei plătite. Dacă o sumă este încasată de două ori dintr-o eroare tehnică, o restituim.
        </p>
      </Section>

      <Section title="9. Renunțare și dreptul de retragere">
        <Subsection title="Profesioniști">
          <p>
            Dacă acționezi ca profesionist, dreptul legal de retragere de 14 zile, prevăzut pentru consumatori, nu se aplică. Poți opri folosirea serviciului scriindu-ne. Perioada deja plătită nu se restituie, în afară de o plată dublă, de o neexecutare din culpa noastră sau de un alt caz în care legea obligă la restituire.
          </p>
        </Subsection>
        <Subsection title="Consumatori">
          <p>
            Dacă ești consumator și închei contractul la distanță, te poți retrage în 14 zile de la încheiere, fără să invoci un motiv, potrivit OUG nr. 34/2014. Dacă ne-ai cerut expres să începem activarea profilului în aceste 14 zile, iar apoi te retragi, datorezi o sumă proporțională cu zilele deja folosite.
          </p>
          <p>
            Dreptul de retragere se pierde doar dacă serviciul a fost executat integral în cele 14 zile și, înainte de comandă, ne-ai dat acordul expres să începem executarea și ai confirmat că știi că pierzi acest drept la executarea integrală. Fără această confirmare separată, cele 14 zile rămân deschise.
          </p>
          <p>
            Retragerea se trimite la {COMPANY.email}, printr-o declarație clară sau prin formularul de mai jos. Termenul este respectat dacă trimiți mesajul înainte de expirare. Îți confirmăm primirea. Restituirea, când este datorată, se face în cel mult 14 zile, prin aceeași metodă de plată, dacă nu stabilești altfel și dacă nu ai costuri suplimentare.
          </p>
        </Subsection>
        <Subsection title="Formular de retragere">
          <p>Către {COMPANY.name}, {COMPANY.address}, {COMPANY.email}:</p>
          <p>
            Vă informez că mă retrag din contractul privind abonamentul Sportisia. Numele consumatorului, adresa, emailul, data comenzii, suma și semnătura (dacă se trimite pe hârtie). Data.
          </p>
        </Subsection>
      </Section>

      <Section title="10. Ce nu este permis">
        <p>Nu folosi site-ul ca să:</p>
        <ul>
          <li>publici date false despre o facilitate sau să te dai drept proprietar fără drept;</li>
          <li>încarci viruși, să încerci accesul neautorizat sau să ocolești limitările tehnice;</li>
          <li>copiezi baza de date sau paginile în mod automat, în afara indexării obișnuite a motoarelor de căutare;</li>
          <li>trimiți spam prin formulare sau comentarii;</li>
          <li>publici conținut ilegal, defăimător, discriminatoriu sau care încalcă drepturile de autor ori mărcile altcuiva.</li>
        </ul>
        <p>Putem scoate conținutul, limita accesul și, când legea o cere, anunța autoritățile.</p>
      </Section>

      <Section title="11. Drepturile noastre asupra site-ului">
        <p>
          Marca Sportisia, structura site-ului, textele noastre, designul și selecția directorului ne aparțin sau ne sunt licențiate. Poți face link către o pagină publică. Nu poți copia site-ul, marca sau baza de profiluri ca să faci un serviciu concurent, fără acordul nostru scris.
        </p>
        <p>
          Butoanele de distribuire de pe blog deschid WhatsApp, Facebook sau X doar când apeși tu. Nu încărcăm scripturile lor în pagină.
        </p>
      </Section>

      <Section title="12. Disponibilitatea">
        <p>
          Încercăm să ținem site-ul disponibil, dar întreținerea, o defecțiune sau un furnizor extern pot întrerupe accesul. O întrerupere temporară nu este, singură, o neexecutare care dă dreptul la daune, dacă o remediem într-un termen rezonabil. Pentru o întrerupere lungă, din culpa noastră, a unei perioade deja plătite, consumatorul poate cere o prelungire proporțională sau, dacă serviciul nu mai poate fi folosit, o restituire proporțională.
        </p>
      </Section>

      <Section title="13. Răspunderea">
        <p>
          Informațiile din profiluri sunt date de proprietari sau de cei care trimit sugestii. Nu verificăm în prealabil fiecare preț, program sau fotografie. Nu răspundem pentru faptele unui proprietar față de clienții lui, pentru pierderi indirecte sau pentru lipsa unui câștig, în măsura în care legea permite această limitare.
        </p>
        <p>
          Față de un profesionist, răspunderea noastră totală pentru un an contractual este limitată la sumele plătite de el către noi în ultimele 12 luni pentru abonament. Limitarea nu acoperă dolul, culpa gravă sau vătămarea vieții, integrității ori sănătății, și nu înlătură drepturile pe care legea le dă consumatorului și pe care nu le putem exclude.
        </p>
      </Section>

      <Section title="14. Reclamații">
        <p>
          Reclamațiile despre serviciu se trimit la {COMPANY.email}. Îți răspundem în cel mult 30 de zile. Dacă ești consumator, poți apela și la Autoritatea Națională pentru Protecția Consumatorilor, <a href={COMPANY.anpc} target="_blank" rel="noopener noreferrer">anpc.ro</a>, și la platforma europeană de soluționare online a litigiilor, <a href={COMPANY.sol} target="_blank" rel="noopener noreferrer">ec.europa.eu/consumers/odr</a>.
        </p>
        <p>
          Pentru consumatori, instanțele de la domiciliul lor rămân disponibile. Pentru profesioniști, litigiile se soluționează de instanțele competente de la sediul nostru, din Baia Mare, dacă legea nu impune o altă instanță.
        </p>
        <p>Termenii sunt guvernați de legea română.</p>
      </Section>

      <Section title="15. Modificarea termenilor">
        <p>
          Putem actualiza termenii când se schimbă serviciul sau legea. Data din antet este data versiunii. Pentru vizitatori, versiunea nouă se aplică de la publicare. Pentru un abonament deja plătit, schimbările care îți reduc drepturile nu se aplică perioadei în curs, decât dacă legea o cere sau dacă le accepți. Folosirea în continuare după expirarea perioadei plătite înseamnă acceptarea versiunii afișate atunci.
        </p>
        <p>
          Dacă o clauză este anulată de o instanță sau este contrară unei norme obligatorii, restul termenilor rămân în vigoare. Norma obligatorie înlocuiește clauza anulată.
        </p>
      </Section>
    </LegalLayout>
  )
}
