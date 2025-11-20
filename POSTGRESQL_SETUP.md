# 🐘 Configurare PostgreSQL pentru Hostinger

## Pași pentru migrarea la PostgreSQL

### Pasul 1: Creează baza de date PostgreSQL pe Hostinger

1. **Intră în panoul de control Hostinger**
2. **Găsește secțiunea "Databases" sau "PostgreSQL"**
3. **Creează o nouă bază de date PostgreSQL:**
   - Nume bază de date: `sportisiaro` (sau alt nume)
   - Utilizator: `sportisiaro_user` (sau alt nume)
   - Parolă: generează o parolă sigură și noteaz-o
   - Host: de obicei `localhost` sau un host specific
   - Port: de obicei `5432`

4. **Notează toate detaliile:**
   - Host: `localhost` (sau host-ul specificat)
   - Port: `5432` (sau port-ul specificat)
   - Database: `sportisiaro`
   - User: `sportisiaro_user`
   - Password: `[parola generată]`

### Pasul 2: Construiește connection string-ul

Formatul connection string-ului pentru PostgreSQL:
```
postgresql://[user]:[password]@[host]:[port]/[database]?schema=public
```

**Exemplu:**
```
postgresql://sportisiaro_user:parola123@localhost:5432/sportisiaro?schema=public
```

**Dacă Hostinger folosește SSL:**
```
postgresql://sportisiaro_user:parola123@localhost:5432/sportisiaro?schema=public&sslmode=require
```

### Pasul 3: Adaugă variabila de mediu pe Hostinger

1. **Intră în panoul de control Hostinger**
2. **Găsește secțiunea "Environment Variables" sau "Build Settings"**
3. **Adaugă variabila:**
   - **Nume:** `DATABASE_URL`
   - **Valoare:** connection string-ul construit la pasul 2

### Pasul 4: Actualizează codul (deja făcut ✅)

Codul a fost deja actualizat:
- ✅ Schema Prisma folosește `provider = "postgresql"`
- ✅ `lib/prisma.ts` a fost simplificat pentru PostgreSQL
- ✅ Eliminată logica specifică SQLite

### Pasul 5: Rulează migrațiile

După ce ai setat `DATABASE_URL` pe Hostinger și ai făcut deploy:

**Opțiunea A: Via SSH (dacă ai acces)**
```bash
cd ~/domains/lavender-cassowary-938357.hostingersite.com/public_html
npm run db:push
```

**Opțiunea B: Via API endpoint (automat)**
După deploy, accesează:
```
https://lavender-cassowary-938357.hostingersite.com/api/setup
```

Acest endpoint va:
1. Verifica conexiunea la PostgreSQL
2. Crea tabelele dacă nu există (prin Prisma)
3. Adăuga 5 terenuri demo

### Pasul 6: Verifică că funcționează

După ce ai rulat migrațiile, verifică:
```
https://lavender-cassowary-938357.hostingersite.com/api/fields
```

Ar trebui să returneze un array JSON cu terenurile.

---

## 🔧 Alternativă: Servicii PostgreSQL externe (gratuite)

Dacă Hostinger nu oferă PostgreSQL, poți folosi unul dintre aceste servicii:

### 1. Supabase (Recomandat - gratuit până la 500MB)
1. Creează cont la https://supabase.com
2. Creează un proiect nou
3. Mergi la "Settings" → "Database"
4. Copiază connection string-ul (format: `postgresql://postgres:[password]@[host]:5432/postgres`)
5. Adaugă `?schema=public` la sfârșit
6. Adaugă connection string-ul ca `DATABASE_URL` pe Hostinger

### 2. Neon (Gratuit până la 3GB)
1. Creează cont la https://neon.tech
2. Creează un proiect nou
3. Copiază connection string-ul
4. Adaugă `?schema=public` la sfârșit
5. Adaugă connection string-ul ca `DATABASE_URL` pe Hostinger

### 3. Railway (Gratuit cu limită)
1. Creează cont la https://railway.app
2. Creează un proiect PostgreSQL
3. Copiază connection string-ul
4. Adaugă `?schema=public` la sfârșit
5. Adaugă connection string-ul ca `DATABASE_URL` pe Hostinger

---

## ⚠️ Probleme comune

### Eroare: "relation does not exist"
**Soluție:** Rulează `npm run db:push` sau accesează `/api/setup`

### Eroare: "password authentication failed"
**Soluție:** Verifică că parola din connection string este corectă

### Eroare: "could not connect to server"
**Soluție:** 
- Verifică că host-ul și port-ul sunt corecte
- Verifică că baza de date PostgreSQL este activă
- Dacă folosești serviciu extern, verifică firewall-ul

### Eroare: "database does not exist"
**Soluție:** Creează baza de date în panoul de control

---

## 📝 Verificare finală

După configurare, verifică:
1. ✅ `DATABASE_URL` este setat corect pe Hostinger
2. ✅ Baza de date PostgreSQL există și este accesibilă
3. ✅ Tabelele au fost create (accesează `/api/setup`)
4. ✅ Poți accesa datele (accesează `/api/fields`)

---

## 🎉 Gata!

Acum aplicația folosește PostgreSQL și datele nu vor mai dispărea la fiecare deploy!

