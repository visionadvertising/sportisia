# Fix Credentials Issue

## Problema

Aplicația primește eroarea: "Authentication failed against database server at `localhost`, the provided database credentials for `u328389087_sportisiaro_us` are not valid."

## Verificări necesare

### 1. Verifică exact ce credențiale folosește aplicația

Accesează: `https://lavender-cassowary-938357.hostingersite.com/api/check-credentials`

Aceasta va afișa:
- Dacă fișierul `.env` este găsit
- Conținutul exact al `DATABASE_URL` din `.env`
- Componentele parseate (user, password length, host, port, database)

### 2. Verifică pe server că `.env` este corect

Conectează-te via SSH și verifică:

```bash
cd /home/u328389087/domains/lavender-cassowary-938357.hostingersite.com/public_html
cat .env
```

Ar trebui să vezi exact:
```
DATABASE_URL=mysql://u328389087_sportisiaro_us:Csl19920903@localhost:3306/u328389087_sportisiaro
```

### 3. Verifică în panoul Hostinger

1. **Utilizatorul MySQL**: Trebuie să fie exact `u328389087_sportisiaro_us` (nu `u328389087_sportisiaro_user`)
2. **Parola**: Trebuie să fie exact `Csl19920903`
3. **Baza de date**: Trebuie să fie exact `u328389087_sportisiaro`
4. **Permisiuni**: Utilizatorul trebuie să aibă permisiuni pentru baza de date

### 4. Dacă utilizatorul este diferit

Dacă în panoul Hostinger utilizatorul este `u328389087_sportisiaro_user` (cu `_user` la sfârșit), actualizează `.env`:

```bash
cd /home/u328389087/domains/lavender-cassowary-938357.hostingersite.com/public_html
echo 'DATABASE_URL=mysql://u328389087_sportisiaro_user:Csl19920903@localhost:3306/u328389087_sportisiaro' > .env
chmod 644 .env
cat .env
```

### 5. Dacă parola conține caractere speciale

Dacă parola conține caractere speciale (#, +, /, etc.), trebuie să fie URL-encoded în connection string:
- `#` → `%23`
- `+` → `%2B`
- `/` → `%2F`
- `@` → `%40`
- `:` → `%3A`

### 6. Verifică permisiunile utilizatorului

În panoul Hostinger, verifică că utilizatorul `u328389087_sportisiaro_us` are permisiuni pentru baza de date `u328389087_sportisiaro`.

## Testare

După ce ai actualizat `.env`, accesează din nou:
- `https://lavender-cassowary-938357.hostingersite.com/api/check-credentials` - pentru a vedea credențialele
- `https://lavender-cassowary-938357.hostingersite.com/api/setup` - pentru a testa conexiunea

