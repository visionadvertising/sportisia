# Sportisiaro

Platformă pentru găsirea și adăugarea terenurilor sportive.

## Structură Proiect

- **Frontend:** Vite + React + TypeScript
- **Backend:** Node.js + Express + MySQL

## Instalare

### Frontend
```bash
npm install
npm run dev
```

### Backend
```bash
cd server
npm install
npm start
```

## Configurare Baza de Date

Vezi `DATABASE_CONFIG.md` pentru detalii despre configurarea bazei de date MySQL.

## Deployment

### Frontend (Vite)
- Build: `npm run build`
- Output: `dist/`
- Configurează Hostinger să servească din `dist/`

### Backend (Node.js)
- Rulează pe port 3001 (sau configurează PORT în environment variables)
- Asigură-te că `DATABASE_URL` este setat corect
