# Instrucțiuni de Setup

## Pași rapizi pentru a porni aplicația

### 1. Instalare dependențe
```bash
npm install
```

### 2. Configurare bază de date

Creează fișierul `.env` în root-ul proiectului (dacă nu există deja):

**Pentru MySQL (recomandat pentru producție pe Hostinger):**
```
DATABASE_URL="mysql://user:password@localhost:3306/database"
```

**Pentru SQLite (doar pentru development local):**
```
DATABASE_URL="file:./data/database.db"
```

**Notă:** Aplicația folosește acum MySQL pentru producție. Vezi `MYSQL_SETUP.md` pentru instrucțiuni detaliate pentru Hostinger.

### 3. Inițializare bază de date

```bash
# Generează clientul Prisma
npm run db:generate

# Creează baza de date și tabelele
npm run db:push
```

### 4. Pornire aplicație

```bash
npm run dev
```

Aplicația va fi disponibilă la: `http://localhost:3000`

## Comenzi utile

- `npm run dev` - Pornește serverul de dezvoltare
- `npm run build` - Construiește aplicația pentru producție
- `npm run start` - Pornește aplicația în mod producție
- `npm run db:generate` - Generează clientul Prisma
- `npm run db:push` - Actualizează baza de date cu schema
- `npm run db:migrate` - Creează migrație pentru versiune controlată
- `npm run db:studio` - Deschide Prisma Studio (interfață grafică)

## Verificare

După setup, verifică că:
1. Baza de date a fost creată în `data/database.db`
2. Aplicația pornește fără erori
3. Poți accesa `http://localhost:3000`

## Probleme comune

### Eroare: "Prisma Client has not been generated"
Soluție: Rulează `npm run db:generate`

### Eroare: "Database does not exist"
Soluție: Rulează `npm run db:push`

### Eroare: "Cannot find module '@prisma/client'"
Soluție: Rulează `npm install` din nou


