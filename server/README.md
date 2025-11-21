# Backend Server - Sportisiaro

## Setup Automat

Backend-ul se configurează automat când se face deploy.

## Structură

- `index.js` - Server Express principal
- `package.json` - Dependențe și scripturi
- `start.sh` - Script pentru a porni backend-ul
- `.env` - Variabile de mediu (se creează automat)

## Comenzi Manuale (dacă e nevoie)

```bash
# Instalează dependențele
npm install

# Pornește backend-ul
npm start

# Sau folosește scriptul
chmod +x start.sh
./start.sh
```

## Environment Variables

Creează `.env` cu:
```
DATABASE_URL=mysql://u328389087_sportisia:Csl19920903@localhost:3306/u328389087_sportisia
PORT=3001
NODE_ENV=production
```

## PM2 (Recomandat pentru Production)

```bash
# Instalează PM2
npm install -g pm2

# Pornește
pm2 start index.js --name sportisiaro-api

# Salvează
pm2 save

# Status
pm2 status
```

