# Comenzi SSH pentru Setup Backend

## 1. Conectare SSH
```bash
ssh u328389087@papayawhip-narwhal-717195.hostingersite.com
```

## 2. Navigare la directorul proiectului
```bash
cd ~/domains/papayawhip-narwhal-717195.hostingersite.com/public_html
# sau
cd ~/public_html
```

## 3. Verifică structura proiectului
```bash
ls -la
ls -la server/
```

## 4. Instalează dependențele backend-ului
```bash
cd server
npm install
```

## 5. Creează fișierul .env pentru backend
```bash
cd ~/domains/papayawhip-narwhal-717195.hostingersite.com/public_html/server
nano .env
```

Adaugă în `.env`:
```
DATABASE_URL=mysql://u328389087_sportisia:Csl19920903@localhost:3306/u328389087_sportisia
PORT=3001
NODE_ENV=production
```

Salvează: `Ctrl+X`, apoi `Y`, apoi `Enter`

## 6. Instalează PM2 pentru a rula backend-ul în background
```bash
npm install -g pm2
```

## 7. Pornește backend-ul cu PM2
```bash
cd ~/domains/papayawhip-narwhal-717195.hostingersite.com/public_html/server
pm2 start index.js --name sportisiaro-api
```

## 8. Configurează PM2 să pornească la restart
```bash
pm2 startup
pm2 save
```

## 9. Verifică statusul
```bash
pm2 status
pm2 logs sportisiaro-api
```

## 10. Verifică că backend-ul răspunde
```bash
curl http://localhost:3001/api/fields
```

## Comenzi utile PM2:
- `pm2 restart sportisiaro-api` - restart backend
- `pm2 stop sportisiaro-api` - oprește backend
- `pm2 logs sportisiaro-api` - vezi log-urile
- `pm2 delete sportisiaro-api` - șterge procesul

## Dacă PM2 nu este disponibil:
Poți rula backend-ul direct (dar se va opri când închizi SSH):
```bash
cd ~/domains/papayawhip-narwhal-717195.hostingersite.com/public_html/server
nohup node index.js > server.log 2>&1 &
```

## Actualizează frontend-ul
După ce backend-ul rulează, actualizează `src/config.ts` cu URL-ul corect:
```typescript
const API_BASE_URL = 'https://papayawhip-narwhal-717195.hostingersite.com/api'
```

Și configurează reverse proxy în `.htaccess` sau contactează suportul Hostinger pentru a configura proxy-ul pentru `/api/*` către `localhost:3001`.

