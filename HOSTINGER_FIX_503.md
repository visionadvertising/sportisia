# Fix 503 Service Unavailable

## Problema
Eroarea 503 înseamnă că backend-ul nu rulează sau nu este accesibil.

## Soluții

### 1. Verifică în Panoul Hostinger

În aplicația ta Node.js, verifică:

**Start Command:**
```
node server/index.js
```

**Sau:**
```
cd server && node index.js
```

**Sau dacă ai script în package.json:**
```
npm run start:backend
```

### 2. Verifică Log-urile

În panoul Hostinger, caută:
- "Logs" sau "Application Logs"
- Ar trebui să vezi: `🚀 Server running on port 3001`

### 3. Verifică Dependențele

Backend-ul trebuie să aibă `node_modules` instalate:

În panoul Hostinger, la aplicația Node.js:
- Verifică dacă există opțiunea "Install Dependencies"
- Sau rulează manual: `npm install` în directorul `server/`

### 4. Verifică Port-ul

Pe Hostinger, aplicațiile Node.js folosesc de obicei un port specific din environment.
Backend-ul va folosi automat `process.env.PORT` dacă este setat.

### 5. Verifică .htaccess

Dacă folosești `.htaccess` pentru proxy:
- Asigură-te că este în `public_html/` (nu în `dist/`)
- Verifică că mod_rewrite și mod_proxy sunt activate

### 6. Alternativă: Serve Backend Direct

Dacă `.htaccess` nu funcționează, poți accesa backend-ul direct:
```
https://papayawhip-narwhal-717195.hostingersite.com:PORT/api/health
```

Sau configurează frontend-ul să folosească URL-ul complet al backend-ului.

## Verificare Rapidă

1. **Backend rulează?** → Verifică log-urile în Hostinger
2. **Dependențele instalate?** → Verifică `server/node_modules`
3. **Port corect?** → Verifică environment variables în Hostinger
4. **.htaccess funcționează?** → Testează direct backend-ul pe port

