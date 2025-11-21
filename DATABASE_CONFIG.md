# Configurare Baza de Date MySQL

## Credențiale Baza de Date

- **Host:** `localhost`
- **Port:** `3306`
- **Database:** `u328389087_sportisia`
- **Username:** `u328389087_sportisia`
- **Password:** `Csl19920903`

## DATABASE_URL

```
mysql://u328389087_sportisia:Csl19920903@localhost:3306/u328389087_sportisia
```

## Configurare pe Hostinger

1. Intră în panoul Hostinger
2. Navighează la: **Management > Websites > [site-ul tău] > Environment Variables**
3. Adaugă variabila:
   - **Nume:** `DATABASE_URL`
   - **Valoare:** `mysql://u328389087_sportisia:Csl19920903@localhost:3306/u328389087_sportisia`
4. Click **Save**
5. Declanșează rebuild-ul

## Verificare

După ce ai setat `DATABASE_URL`, verifică accesând:
- `https://papayawhip-narwhal-717195.hostingersite.com/api/test-db` (dacă există endpoint-ul)

