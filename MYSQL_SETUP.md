# 🗄️ Configurare MySQL pentru Hostinger

## Pași pentru configurarea MySQL pe Hostinger

### Pasul 1: Creează baza de date MySQL pe Hostinger

1. **Intră în panoul de control Hostinger**
2. **Navighează la:** Management > Websites > [site-ul tău] > Databases > Management
3. **În secțiunea "Create a New MySQL Database And Database User":**
   - **MySQL database name:** `sportisiaro` (sau alt nume - prefixul `u328389087_` va fi adăugat automat)
   - **MySQL username:** `sportisiaro_user` (sau alt nume - prefixul va fi adăugat automat)
   - **Password:** Generează o parolă sigură folosind butonul cu trei puncte sau introdu manual
4. **Click pe butonul verde "Create"**

5. **Notează detaliile:**
   - Database: `u328389087_sportisiaro` (cu prefixul)
   - User: `u328389087_sportisiaro_user` (cu prefixul)
   - Password: `[parola generată]`
   - Host: de obicei `localhost`
   - Port: de obicei `3306`

### Pasul 2: Construiește connection string-ul

Formatul connection string-ului pentru MySQL:
```
mysql://[user]:[password]@[host]:[port]/[database]
```

**Exemplu cu datele tale:**
```
mysql://u328389087_sportisiaro_user:parola123@localhost:3306/u328389087_sportisiaro
```

**Important:** 
- Folosește prefixul `u328389087_` pentru user și database
- Host-ul este de obicei `localhost`
- Port-ul este de obicei `3306`

### Pasul 3: Adaugă variabila de mediu pe Hostinger

1. **Intră în panoul de control Hostinger**
2. **Găsește secțiunea "Environment Variables" sau "Build Settings"**
   - Poate fi în secțiunea de deploy/build settings
   - Sau în secțiunea de aplicații/Node.js settings
3. **Adaugă variabila:**
   - **Nume:** `DATABASE_URL`
   - **Valoare:** connection string-ul construit la pasul 2

### Pasul 4: Actualizează codul (deja făcut ✅)

Codul a fost deja actualizat:
- ✅ Schema Prisma folosește `provider = "mysql"`
- ✅ `lib/prisma.ts` a fost actualizat pentru MySQL
- ✅ Eliminată logica specifică SQLite

### Pasul 5: Declanșează rebuild-ul

După ce ai setat `DATABASE_URL`, declanșează rebuild-ul manual în panoul Hostinger.

### Pasul 6: Rulează migrațiile (după rebuild)

**Opțiunea A: Via SSH (dacă ai acces)**
```bash
cd ~/domains/lavender-cassowary-938357.hostingersite.com/public_html
npm run db:push
```

**Opțiunea B: Via API endpoint (automat)**
După rebuild, accesează:
```
https://lavender-cassowary-938357.hostingersite.com/api/setup
```

Acest endpoint va:
1. Verifica conexiunea la MySQL
2. Sugera rularea `npm run db:push` dacă tabelele nu există
3. Adăuga 5 terenuri demo după ce tabelele sunt create

### Pasul 7: Verifică că funcționează

După ce ai rulat migrațiile, verifică:
```
https://lavender-cassowary-938357.hostingersite.com/api/fields
```

Ar trebui să returneze un array JSON cu terenurile.

---

## 🔧 Găsirea detaliilor bazei de date

După ce ai creat baza de date, poți găsi detaliile complete în:
- **Panoul Hostinger** → **Databases** → **Management**
- În lista "List of Current MySQL Databases And Users" vei vedea:
  - Numele bazei de date
  - Numele utilizatorului
  - Host-ul (de obicei `localhost`)
  - Port-ul (de obicei `3306`)

---

## ⚠️ Probleme comune

### Eroare: "Access denied for user"
**Soluție:** 
- Verifică că username-ul și parola sunt corecte
- Asigură-te că ai folosit prefixul `u328389087_` pentru user și database
- Verifică că utilizatorul are permisiuni pentru baza de date

### Eroare: "Unknown database"
**Soluție:** 
- Verifică că numele bazei de date este corect (cu prefixul)
- Asigură-te că baza de date a fost creată cu succes

### Eroare: "Can't connect to MySQL server"
**Soluție:** 
- Verifică că host-ul este `localhost`
- Verifică că port-ul este `3306`
- Dacă folosești un host extern, verifică firewall-ul

### Eroare: "Table doesn't exist"
**Soluție:** Rulează `npm run db:push` sau accesează `/api/setup`

---

## 📝 Verificare finală

După configurare, verifică:
1. ✅ `DATABASE_URL` este setat corect pe Hostinger
2. ✅ Baza de date MySQL există și este accesibilă
3. ✅ Tabelele au fost create (accesează `/api/setup`)
4. ✅ Poți accesa datele (accesează `/api/fields`)

---

## 🎉 Gata!

Acum aplicația folosește MySQL și datele nu vor mai dispărea la fiecare deploy!

**Avantaje MySQL pe Hostinger:**
- ✅ Disponibil direct în panou
- ✅ Nu necesită servicii externe
- ✅ Datele persistă între deploy-uri
- ✅ Performanță bună pentru aplicații mici/medii

