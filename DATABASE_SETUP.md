# 🗄️ Configurare Baza de Date pentru Producție

## Opțiuni disponibile

### 1. SQLite (Simplu - pentru început)
**Avantaje:**
- ✅ Simplu de configurat
- ✅ Nu necesită server de bază de date separat
- ✅ Perfect pentru proiecte mici/medii

**Dezavantaje:**
- ⚠️ Nu este ideal pentru trafic mare
- ⚠️ Limitări la concurență (multiple scrieri simultane)
- ⚠️ Poate avea probleme pe hosting-uri shared

**Configurare:**
```env
DATABASE_URL="file:./data/database.db"
```

### 2. PostgreSQL (Recomandat pentru producție)
**Avantaje:**
- ✅ Performanță excelentă
- ✅ Suport pentru trafic mare
- ✅ Relații complexe între date
- ✅ Backup și replicare ușoară

**Dezavantaje:**
- ⚠️ Necesită server de bază de date separat
- ⚠️ Configurare mai complexă

**Configurare:**
```env
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
```

### 3. MySQL (Alternativă)
**Avantaje:**
- ✅ Foarte popular și bine suportat
- ✅ Multe opțiuni de hosting
- ✅ Performanță bună

**Configurare:**
```env
DATABASE_URL="mysql://user:password@host:port/database"
```

---

## 📋 Pași pentru configurare pe hosting

### Opțiunea 1: SQLite (Rapid)

1. **Adaugă variabila de mediu pe hosting:**
   ```
   DATABASE_URL=file:./data/database.db
   ```

2. **Asigură-te că directorul `data/` există și are permisiuni de scriere**

3. **După deploy, rulează migrațiile:**
   ```bash
   npm run db:push
   ```

4. **Opțional - adaugă date demo:**
   ```bash
   npm run db:seed
   ```

### Opțiunea 2: PostgreSQL (Recomandat)

#### Pasul 1: Creează baza de date PostgreSQL

**Opțiuni de hosting pentru PostgreSQL:**
- **Supabase** (gratuit până la 500MB): https://supabase.com
- **Neon** (gratuit până la 3GB): https://neon.tech
- **Railway** (gratuit cu limită): https://railway.app
- **Render** (gratuit cu limită): https://render.com
- **Hostinger** (dacă oferă PostgreSQL)

#### Pasul 2: Obține connection string-ul

După ce creezi baza de date, vei primi un connection string de forma:
```
postgresql://user:password@host:5432/database?sslmode=require
```

#### Pasul 3: Actualizează schema Prisma

Editează `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // Schimbă de la "sqlite"
  url      = env("DATABASE_URL")
}
```

#### Pasul 4: Adaugă variabila de mediu pe hosting

În panoul de control al hosting-ului, adaugă:
```
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```

#### Pasul 5: Rulează migrațiile

După deploy, rulează:
```bash
npm run db:push
# sau
npm run db:migrate
```

#### Pasul 6: Adaugă date demo (opțional)
```bash
npm run db:seed
```

---

## 🔧 Configurare pentru Hostinger

### Dacă Hostinger oferă PostgreSQL:

1. Creează baza de date PostgreSQL din panoul de control
2. Notează detaliile de conexiune (host, port, user, password, database)
3. Adaugă variabila de mediu `DATABASE_URL` în setările de build
4. Actualizează `prisma/schema.prisma` la `provider = "postgresql"`
5. Commit și push modificările
6. După deploy, rulează `npm run db:push` (dacă platforma permite)

### Dacă Hostinger NU oferă PostgreSQL:

Folosește SQLite:
1. Adaugă variabila de mediu: `DATABASE_URL=file:./data/database.db`
2. Asigură-te că directorul `data/` are permisiuni de scriere
3. După deploy, rulează `npm run db:push`

---

## 🚀 Comenzi pentru inițializare

### Prima dată când deploy-ezi:

```bash
# 1. Generează clientul Prisma
npm run db:generate

# 2. Creează tabelele în baza de date
npm run db:push

# 3. (Opțional) Adaugă date demo
npm run db:seed
```

### Pentru migrații controlate (recomandat pentru producție):

```bash
# Creează o migrație
npm run db:migrate

# Aplică migrațiile
npx prisma migrate deploy
```

---

## 📝 Verificare

După configurare, verifică că:

1. ✅ Baza de date este creată
2. ✅ Tabelele există (poți folosi `npm run db:studio` local)
3. ✅ Aplicația se conectează la baza de date fără erori
4. ✅ Poți adăuga/edită/șterge date

---

## 🔍 Debugging

### Eroare: "Can't reach database server"
- Verifică că `DATABASE_URL` este corect configurat
- Verifică că serverul de bază de date este accesibil
- Pentru PostgreSQL, verifică firewall-ul și SSL

### Eroare: "Database does not exist"
- Rulează `npm run db:push` pentru a crea tabelele
- Verifică că baza de date există pe server

### Eroare: "Permission denied" (SQLite)
- Verifică permisiunile directorului `data/`
- Asigură-te că aplicația are drepturi de scriere

---

## 💡 Recomandări

Pentru **producție**, recomandăm:
1. **PostgreSQL** pentru performanță și scalabilitate
2. **Backup-uri regulate** ale bazei de date
3. **Migrații versionate** (nu `db:push` direct în producție)
4. **Variabile de mediu** separate pentru dev/prod

