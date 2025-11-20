# Sportisiaro - Aplicație Web pentru Terenuri Sportive

Aplicație web simplificată pentru gestionarea terenurilor sportive (tenis, fotbal, baschet, etc.). Proprietarii de terenuri pot lista terenurile lor, iar clienții pot vedea datele de contact și detalii despre acestea.

## Funcționalități

- ✅ Listare terenuri sportive cu filtrare pe tip
- ✅ **Căutare** - Caută terenuri după nume, locație sau oraș
- ✅ **Sortare** - Sortează după nume, preț sau dată
- ✅ Vizualizare detalii teren (locație, contact, facilități, preț)
- ✅ Adăugare teren nou cu validări complete
- ✅ Editare teren existent cu validări
- ✅ Ștergere teren cu confirmare
- ✅ Suport pentru imagini (URL)
- ✅ Validări formulare (email, telefon, URL)
- ✅ Interfață modernă și responsive
- ✅ Baza de date SQLite cu Prisma ORM

## Tehnologii

- **Next.js 14** - Framework React cu App Router
- **TypeScript** - Tipuri statice pentru siguranță
- **Prisma** - ORM pentru gestionarea bazei de date
- **SQLite** - Bază de date relațională (locală)
- **CSS** - Stilizare modernă cu design responsive

## Instalare

1. Instalează dependențele:
```bash
npm install
```

2. Configurează baza de date:
```bash
# Generează clientul Prisma
npm run db:generate

# Creează baza de date și tabelele
npm run db:push
```

3. Pornește serverul de dezvoltare:
```bash
npm run dev
```

4. Deschide aplicația în browser la adresa:
```
http://localhost:3000
```

### Comenzi utile pentru baza de date:

```bash
# Generează clientul Prisma (după modificări în schema)
npm run db:generate

# Actualizează baza de date cu schema
npm run db:push

# Creează migrație (pentru versiune controlată)
npm run db:migrate

# Deschide Prisma Studio (interfață grafică pentru baza de date)
npm run db:studio
```

## Structură Proiect

```
sportisiaro/
├── app/
│   ├── api/
│   │   └── fields/          # API routes pentru terenuri
│   ├── field/[id]/         # Pagină detalii teren
│   ├── add-field/          # Pagină adăugare teren
│   ├── edit-field/[id]/    # Pagină editare teren
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx             # Pagină principală (listă terenuri)
│   └── globals.css          # Stiluri globale
├── lib/
│   ├── types.ts             # Tipuri TypeScript
│   ├── data.ts              # Funcții pentru gestionarea datelor
│   └── prisma.ts            # Client Prisma
├── prisma/
│   └── schema.prisma        # Schema bazei de date
├── data/
│   └── database.db          # Baza de date SQLite
└── package.json
```

## Utilizare

### Pentru proprietarii de terenuri:

1. Accesează pagina principală
2. Click pe "Adaugă Teren"
3. Completează formularul cu:
   - Nume teren
   - Tip teren (tenis, fotbal, etc.)
   - Locație și oraș
   - Descriere
   - Facilități disponibile
   - Preț pe oră (opțional)
   - Date de contact (nume, telefon, email)
4. Salvează terenul

### Pentru clienți:

1. Accesează pagina principală
2. Filtrează terenurile după tip (sau vezi toate)
3. Click pe un teren pentru a vedea detalii complete
4. Contactează proprietarul folosind datele afișate

## Baza de Date

Aplicația folosește **SQLite** cu **Prisma ORM** pentru stocarea datelor. Baza de date este stocată local în `data/database.db`.

### Schema Bazei de Date

Tabelul `SportsField` conține următoarele câmpuri:
- `id` - UUID (identificator unic)
- `name` - Numele terenului
- `type` - Tipul terenului (tenis, fotbal, baschet, etc.)
- `location` - Adresa terenului
- `city` - Orașul
- `description` - Descriere
- `contactName` - Numele persoanei de contact
- `contactPhone` - Telefon
- `contactEmail` - Email
- `amenities` - Facilități (stocate ca JSON)
- `pricePerHour` - Preț pe oră (opțional)
- `imageUrl` - URL imagine (opțional)
- `createdAt` - Data creării
- `updatedAt` - Data ultimei actualizări

### Migrare la PostgreSQL (opțional)

Pentru producție, poți migra la PostgreSQL modificând `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Apoi actualizează variabila de mediu `DATABASE_URL` în `.env`.

## Build pentru Producție

```bash
npm run build
npm start
```

## Licență

MIT

