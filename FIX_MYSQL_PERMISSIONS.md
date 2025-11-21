# Fix MySQL Authentication Issue

## Problema

Aplicația primește eroarea: "Authentication failed against database server at `localhost`, the provided database credentials for `u328389087_sportisiaro_us` are not valid."

## Verificări necesare în panoul Hostinger

### 1. Verifică utilizatorul MySQL

În panoul Hostinger, verifică:
- **Utilizatorul MySQL este exact:** `u328389087_sportisiaro_us` sau `u328389087_sportisiaro_user`?
- **Baza de date este:** `u328389087_sportisiaro`
- **Parola este:** `Csl19920903`

### 2. Verifică permisiunile utilizatorului

**IMPORTANT:** Utilizatorul MySQL trebuie să aibă permisiuni pentru baza de date!

În panoul Hostinger:
1. Mergi la **MySQL Databases**
2. Găsește utilizatorul `u328389087_sportisiaro_us` (sau `u328389087_sportisiaro_user`)
3. Verifică că utilizatorul este asociat cu baza de date `u328389087_sportisiaro`
4. Dacă nu este asociat, asociază-l!

### 3. Verifică host-ul MySQL

Pe Hostinger, host-ul MySQL poate fi diferit de `localhost`. Verifică în panoul Hostinger:
- **Host MySQL:** Poate fi `localhost`, `127.0.0.1`, sau alt hostname
- **Port MySQL:** De obicei `3306`

### 4. Actualizează fișierul .env

După ce ai verificat toate cele de mai sus, actualizează fișierul `.env` pe server:

```bash
cd /home/u328389087/domains/lavender-cassowary-938357.hostingersite.com/public_html

# Dacă utilizatorul este u328389087_sportisiaro_us:
echo 'DATABASE_URL=mysql://u328389087_sportisiaro_us:Csl19920903@localhost:3306/u328389087_sportisiaro' > .env

# SAU dacă utilizatorul este u328389087_sportisiaro_user:
echo 'DATABASE_URL=mysql://u328389087_sportisiaro_user:Csl19920903@localhost:3306/u328389087_sportisiaro' > .env

chmod 644 .env
cat .env
```

### 5. Testează conexiunea directă

Dacă ai acces la phpMyAdmin sau MySQL CLI, testează conexiunea:

```sql
-- Conectează-te cu utilizatorul și parola
-- Verifică dacă poți accesa baza de date
SHOW DATABASES;
USE u328389087_sportisiaro;
SHOW TABLES;
```

## Soluții alternative

### Dacă utilizatorul nu are permisiuni

1. În panoul Hostinger, mergi la **MySQL Databases**
2. Găsește utilizatorul și baza de date
3. Asociază utilizatorul cu baza de date
4. Sau creează un nou utilizator și asociază-l cu baza de date

### Dacă host-ul este diferit

Dacă host-ul MySQL nu este `localhost`, actualizează `.env`:

```bash
# Dacă host-ul este 127.0.0.1:
echo 'DATABASE_URL=mysql://u328389087_sportisiaro_us:Csl19920903@127.0.0.1:3306/u328389087_sportisiaro' > .env

# SAU dacă host-ul este altceva (verifică în panoul Hostinger):
echo 'DATABASE_URL=mysql://u328389087_sportisiaro_us:Csl19920903@[HOST]:3306/u328389087_sportisiaro' > .env
```

## Verificare finală

După ce ai făcut toate modificările:

1. Verifică că fișierul `.env` există și este corect:
   ```bash
   cat /home/u328389087/domains/lavender-cassowary-938357.hostingersite.com/public_html/.env
   ```

2. Accesează: `https://lavender-cassowary-938357.hostingersite.com/api/setup`

3. Ar trebui să funcționeze acum!

