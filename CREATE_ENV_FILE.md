# 🔧 Creare fișier .env pe Hostinger

## Pași pentru a crea fișierul .env pe server

### 1. Conectează-te via SSH la Hostinger

Folosește credențialele SSH din panoul Hostinger.

### 2. Navighează la directorul aplicației

```bash
cd /home/u328389087/domains/lavender-cassowary-938357.hostingersite.com/public_html
```

### 3. Verifică dacă există deja un fișier .env

```bash
ls -la .env
```

### 4. Dacă nu există, creează-l

```bash
nano .env
```

### 5. Adaugă următorul conținut (fără spații în jurul `=`)

```
DATABASE_URL=mysql://u328389087_sportisiaro_user:[PAROLA_TA]@localhost:3306/u328389087_sportisiaro
```

**IMPORTANT:**
- Înlocuiește `[PAROLA_TA]` cu parola reală din baza de date MySQL
- Nu adăuga spații în jurul `=`
- Nu adăuga ghilimele
- Dacă parola conține caractere speciale (#, +, /), trebuie să fie URL-encoded:
  - `#` devine `%23`
  - `+` devine `%2B`
  - `/` devine `%2F`

### 6. Salvează fișierul

- Apasă `Ctrl+X` pentru a ieși
- Apasă `Y` pentru a confirma salvare
- Apasă `Enter` pentru a confirma numele fișierului

### 7. Setează permisiunile corecte

```bash
chmod 644 .env
```

### 8. Verifică că fișierul este corect

```bash
ls -la .env
cat .env
```

Ar trebui să vezi:
- Permisiuni: `-rw-r--r--`
- Conținut: `DATABASE_URL=mysql://...`

### 9. Verifică că aplicația poate citi fișierul

```bash
pwd
```

Ar trebui să vezi: `/home/u328389087/domains/lavender-cassowary-938357.hostingersite.com/public_html`

## Exemplu complet

Dacă parola ta este `K6PI#+/h`, connection string-ul ar trebui să fie:

```
DATABASE_URL=mysql://u328389087_sportisiaro_user:K6PI%23%2B%2Fh@localhost:3306/u328389087_sportisiaro
```

(Parola este URL-encoded: `#` → `%23`, `+` → `%2B`, `/` → `%2F`)

## După crearea fișierului

1. **NU este necesar rebuild** - aplicația va încărca automat `.env` la următorul request
2. **Accesează:** `https://lavender-cassowary-938357.hostingersite.com/api/setup`
3. **Sau încearcă să adaugi un teren** din nou

## Verificare

După ce ai creat fișierul, verifică logurile aplicației în panoul Hostinger - ar trebui să vezi:
- `✅ Loaded .env file from: /home/u328389087/...`
- `✅ DATABASE_URL after loading .env: SET`

