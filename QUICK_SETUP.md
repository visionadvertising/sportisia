# Setup Rapid - Comenzi SSH

## Pasul 1: Găsește Node.js

```bash
# Rulează acest script pentru a găsi Node.js
bash FIND_NODE.sh

# Sau manual:
which node
which npm
find /usr -name node 2>/dev/null
```

## Pasul 2: Verifică structura

```bash
cd ~/domains/papayawhip-narwhal-717195.hostingersite.com/public_html
ls -la
```

## Pasul 3: Setup Server

```bash
# Dacă server/ nu există, creează-l manual:
mkdir -p server

# Copiază fișierele din repository (după git pull):
# - server/index.js
# - server/package.json

# Sau rulează scriptul de setup:
bash SETUP_SERVER.sh
```

## Pasul 4: Instalează dependențele

```bash
cd server

# Găsește npm
NPM=$(which npm || find /usr -name npm | head -1)

# Instalează
$NPM install
```

## Pasul 5: Pornește backend-ul

```bash
# Găsește node
NODE=$(which node || find /usr -name node | head -1)

# Pornește
$NODE index.js

# Sau folosește scriptul:
cd ..
bash START_BACKEND.sh
```

## Dacă Node.js nu este instalat:

Contactează suportul Hostinger și cere-le să instaleze Node.js 18+ sau 20+.

## Dacă npm nu este în PATH:

Folosește calea completă:
```bash
/usr/local/bin/npm install
# sau
/usr/bin/npm install
```

