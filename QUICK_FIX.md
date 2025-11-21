# 🚀 Fix Rapid - Creare .env pe Server

## Problema
`DATABASE_URL` nu este setat, deci aplicația nu poate conecta la baza de date.

## Soluția (2 minute)

### Pasul 1: Conectează-te via SSH la Hostinger

Folosește credențialele SSH din panoul Hostinger.

### Pasul 2: Creează fișierul .env

```bash
cd /home/u328389087/domains/lavender-cassowary-938357.hostingersite.com/public_html
nano .env
```

### Pasul 3: Adaugă conținutul (copiază exact, fără spații)

```
DATABASE_URL=mysql://u328389087_sportisiaro_user:[PAROLA_TA]@localhost:3306/u328389087_sportisiaro
```

**IMPORTANT:**
- Înlocuiește `[PAROLA_TA]` cu parola reală din baza de date MySQL
- Dacă parola conține caractere speciale, URL-encode:
  - `#` → `%23`
  - `+` → `%2B`
  - `/` → `%2F`

### Pasul 4: Salvează

- `Ctrl+X` (ieșire)
- `Y` (confirmă salvare)
- `Enter` (confirmă numele)

### Pasul 5: Setează permisiunile

```bash
chmod 644 .env
```

### Pasul 6: Verifică

```bash
cat .env
```

Ar trebui să vezi:
```
DATABASE_URL=mysql://u328389087_sportisiaro_user:...
```

## După crearea fișierului

1. **NU este necesar rebuild** - aplicația va încărca automat `.env` la următorul request
2. **Accesează:** `https://lavender-cassowary-938357.hostingersite.com/api/setup`
3. **Sau încearcă să adaugi un teren** din nou

## Verificare

După ce ai creat fișierul, verifică logurile aplicației în panoul Hostinger - ar trebui să vezi:
- `✅ Loaded .env file from: /home/u328389087/...`

## Dacă încă nu funcționează

Verifică că:
- Fișierul `.env` există: `ls -la .env`
- Conținutul este corect: `cat .env`
- Permisiunile sunt corecte: `chmod 644 .env`
- Nu există spații în jurul `=`
- Parola este URL-encoded dacă conține caractere speciale

