# Comenzi SSH Directe - Rulează-le una câte una

## Pasul 1: Găsește Node.js

```bash
which node
which npm
find /usr -name node 2>/dev/null
find /opt -name node 2>/dev/null
ls -la /usr/local/bin/node* 2>/dev/null
ls -la /usr/bin/node* 2>/dev/null
```

## Pasul 2: Creează directorul server

```bash
cd ~/domains/papayawhip-narwhal-717195.hostingersite.com/public_html
mkdir -p server
cd server
```

## Pasul 3: Creează package.json

```bash
cat > package.json << 'EOF'
{
  "name": "sportisiaro-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.5",
    "cors": "^2.8.5",
    "dotenv": "^16.4.1"
  }
}
EOF
```

## Pasul 4: Creează .env

```bash
cat > .env << 'EOF'
DATABASE_URL=mysql://u328389087_sportisia:Csl19920903@localhost:3306/u328389087_sportisia
PORT=3001
NODE_ENV=production
EOF
```

## Pasul 5: Creează index.js

Copiază conținutul din `server/index.js` din repository sau folosește `cat` cu heredoc.

## Pasul 6: Instalează dependențele

```bash
# Încearcă cu npm din PATH
npm install

# Dacă nu funcționează, folosește calea completă
/usr/local/bin/npm install
# sau
/usr/bin/npm install
# sau
/opt/cpanel/ea-nodejs18/bin/npm install
```

## Pasul 7: Pornește backend-ul

```bash
# Cu node din PATH
node index.js

# Sau cu calea completă
/usr/local/bin/node index.js
# sau
/usr/bin/node index.js
# sau
/opt/cpanel/ea-nodejs18/bin/node index.js
```

## Pentru a rula în background:

```bash
nohup node index.js > server.log 2>&1 &
```

## Verificare:

```bash
curl http://localhost:3001/api/health
```

