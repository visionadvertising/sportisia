# Configurare Hostinger Node.js App

## Setări în Panoul Hostinger

### Pentru aplicația Node.js:

1. **Root Directory:** `./` sau `public_html`
2. **Build Command:** `npm run build`
3. **Start Command:** `npm run start:backend` sau `node server/index.js`
4. **Output Directory:** `dist` (pentru frontend static)
5. **Node Version:** 20.x (sau cea mai recentă)

## Structură Proiect

```
public_html/
├── dist/              # Frontend build (generat de Vite)
├── server/            # Backend Node.js
│   ├── index.js
│   ├── package.json
│   └── .env
├── src/               # Frontend source
├── public/
│   └── .htaccess      # Proxy pentru /api/*
└── package.json       # Root package.json
```

## Verificare

După deploy, verifică:
1. Frontend: `https://papayawhip-narwhal-717195.hostingersite.com`
2. Backend: `https://papayawhip-narwhal-717195.hostingersite.com/api/health`

## Dacă backend-ul nu rulează:

1. Verifică în panoul Hostinger că "Start Command" este setat la `node server/index.js`
2. Verifică log-urile în panoul Hostinger
3. Asigură-te că `server/node_modules` există (rulează `npm install` în `server/`)

