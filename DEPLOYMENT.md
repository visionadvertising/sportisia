# Ghid Deployment Hostinger

## Problema
Vite generează doar fișiere statice (HTML, CSS, JS), deci backend-ul Express trebuie să ruleze separat.

## Soluții

### Opțiunea 1: Backend separat pe Hostinger (Recomandat)

1. **Configurează backend-ul ca aplicație Node.js separată:**
   - Creează un subdomeniu sau folosește un port diferit pentru API
   - De exemplu: `api.papayawhip-narwhal-717195.hostingersite.com`

2. **Actualizează frontend-ul să folosească URL-ul complet al API-ului:**
   - În `src/pages/AddField.tsx`, schimbă `/api/fields` cu URL-ul complet
   - De exemplu: `https://api.papayawhip-narwhal-717195.hostingersite.com/api/fields`

### Opțiunea 2: Backend pe același domeniu (Proxy)

1. **Configurează Hostinger să servească backend-ul:**
   - Rulează serverul Node.js pe port 3001
   - Configurează reverse proxy în `.htaccess` sau configurația serverului

2. **Creează `.htaccess` pentru proxy:**
```apache
RewriteEngine On
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:3001/api/$1 [P,L]
```

### Opțiunea 3: Serverless Functions (dacă Hostinger suportă)

Folosește serverless functions pentru API endpoints dacă Hostinger oferă această opțiune.

## Configurare Rapidă

### 1. Backend pe subdomeniu separată:
```bash
# Pe server, în directorul backend
cd server
npm install
npm start
```

### 2. Actualizează frontend:
În `src/pages/AddField.tsx`, schimbă:
```typescript
const response = await fetch('/api/fields', {
```
cu:
```typescript
const response = await fetch('https://api.tudomeniu.com/api/fields', {
```

### 3. Environment Variables:
Creează un fișier `.env` în `server/`:
```
DATABASE_URL=mysql://u328389087_sportisia:Csl19920903@localhost:3306/u328389087_sportisia
PORT=3001
```

