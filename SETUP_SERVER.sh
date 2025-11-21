#!/bin/bash

# Script pentru setup complet al serverului
# Rulează acest script din public_html

echo "=== Setup Backend Server ==="

# Găsește Node.js și npm
NODE_PATH=$(which node 2>/dev/null || find /usr -name node 2>/dev/null | head -1)
NPM_PATH=$(which npm 2>/dev/null || find /usr -name npm 2>/dev/null | head -1)

# Dacă nu găsește, încearcă căi comune
if [ -z "$NODE_PATH" ]; then
    if [ -f "/usr/local/bin/node" ]; then
        NODE_PATH="/usr/local/bin/node"
    elif [ -f "/usr/bin/node" ]; then
        NODE_PATH="/usr/bin/node"
    elif [ -f "$HOME/.nvm/versions/node/*/bin/node" ]; then
        NODE_PATH=$(find $HOME/.nvm/versions/node -name node | head -1)
    fi
fi

if [ -z "$NPM_PATH" ]; then
    if [ -f "/usr/local/bin/npm" ]; then
        NPM_PATH="/usr/local/bin/npm"
    elif [ -f "/usr/bin/npm" ]; then
        NPM_PATH="/usr/bin/npm"
    elif [ -f "$HOME/.nvm/versions/node/*/bin/npm" ]; then
        NPM_PATH=$(find $HOME/.nvm/versions/node -name npm | head -1)
    fi
fi

echo "Node.js: $NODE_PATH"
echo "NPM: $NPM_PATH"

# Verifică dacă Node.js există
if [ -z "$NODE_PATH" ] || [ ! -f "$NODE_PATH" ]; then
    echo "ERROR: Node.js nu a fost găsit!"
    echo "Instalează Node.js sau contactează suportul Hostinger"
    exit 1
fi

# Creează directorul server dacă nu există
if [ ! -d "server" ]; then
    echo "Creating server directory..."
    mkdir -p server
fi

cd server

# Creează package.json dacă nu există
if [ ! -f "package.json" ]; then
    echo "Creating package.json..."
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
fi

# Creează index.js dacă nu există
if [ ! -f "index.js" ]; then
    echo "ERROR: index.js nu există în server/"
    echo "Asigură-te că ai făcut git pull sau copiază manual fișierele"
    exit 1
fi

# Creează .env
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << 'EOF'
DATABASE_URL=mysql://u328389087_sportisia:Csl19920903@localhost:3306/u328389087_sportisia
PORT=3001
NODE_ENV=production
EOF
fi

# Instalează dependențele
echo "Installing dependencies..."
if [ -n "$NPM_PATH" ]; then
    $NPM_PATH install
else
    # Folosește node direct dacă npm nu este disponibil
    echo "NPM not found, trying alternative method..."
    $NODE_PATH --version
fi

# Creează directorul pentru log-uri
mkdir -p logs

echo "=== Setup Complete ==="
echo "To start the server, run:"
echo "  cd server"
echo "  node index.js"
echo ""
echo "Or use PM2 if available:"
echo "  pm2 start server/index.js --name sportisiaro-api"

