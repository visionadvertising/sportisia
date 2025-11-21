# Setup Complet - Backend pe Același Domeniu

## Structură Finală

```
public_html/
├── dist/              # Frontend Vite (build)
├── server/            # Backend Node.js
│   ├── index.js
│   ├── package.json
│   └── .env
└── .htaccess          # Proxy pentru /api/* către backend
```

## Comenzi SSH (Rulează în ordine)

```bash
# 1. Navighează la directorul proiectului
cd ~/domains/papayawhip-narwhal-717195.hostingersite.com/public_html

# 2. Verifică că există directorul server
ls -la server/

# 3. Intră în directorul server
cd server

# 4. Instalează dependențele
npm install

# 5. Creează fișierul .env
cat > .env << 'EOF'
DATABASE_URL=mysql://u328389087_sportisia:Csl19920903@localhost:3306/u328389087_sportisia
PORT=3001
NODE_ENV=production
EOF

# 6. Creează directorul pentru log-uri
mkdir -p logs

# 7. Instalează PM2 global
npm install -g pm2

# 8. Pornește backend-ul cu PM2
pm2 start index.js --name sportisiaro-api

# 9. Configurează PM2 să pornească automat
pm2 startup
# (Rulează comanda pe care ți-o afișează)

pm2 save

# 10. Verifică statusul
pm2 status

# 11. Testează API-ul
curl http://localhost:3001/api/health
```

## Verificare

### 1. Verifică că backend-ul rulează:
```bash
pm2 logs sportisiaro-api
```

Ar trebui să vezi: `Server running on port 3001`

### 2. Testează API-ul local:
```bash
curl http://localhost:3001/api/health
```

Ar trebui să primești: `{"success":true,"message":"API is running",...}`

### 3. Testează API-ul public:
Deschide în browser:
```
https://papayawhip-narwhal-717195.hostingersite.com/api/health
```

Ar trebui să vezi același răspuns JSON.

## Dacă .htaccess nu funcționează

Dacă proxy-ul nu funcționează, contactează suportul Hostinger și cere-le să:
1. Activeze mod_rewrite și mod_proxy
2. Configureze proxy pentru `/api/*` către `http://localhost:3001/api/*`

## Comenzi Utile

```bash
# Restart backend
pm2 restart sportisiaro-api

# Stop backend
pm2 stop sportisiaro-api

# Vezi log-uri
pm2 logs sportisiaro-api

# Status
pm2 status
```

## Troubleshooting

### Backend nu pornește:
```bash
cd ~/domains/papayawhip-narwhal-717195.hostingersite.com/public_html/server
node index.js
```
Verifică erorile în consolă.

### Eroare de conexiune la baza de date:
Verifică că `DATABASE_URL` din `.env` este corect.

### 404 pe /api/*:
Verifică că `.htaccess` este în `public_html/` (nu în `dist/`).

