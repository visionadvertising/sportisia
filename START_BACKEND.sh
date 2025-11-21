#!/bin/bash

# Script simplu pentru a porni backend-ul
# Rulează din public_html

cd "$(dirname "$0")"

# Găsește Node.js
NODE_PATH=$(which node 2>/dev/null || find /usr -name node 2>/dev/null | head -1)

if [ -z "$NODE_PATH" ]; then
    if [ -f "/usr/local/bin/node" ]; then
        NODE_PATH="/usr/local/bin/node"
    elif [ -f "/usr/bin/node" ]; then
        NODE_PATH="/usr/bin/node"
    fi
fi

if [ -z "$NODE_PATH" ] || [ ! -f "$NODE_PATH" ]; then
    echo "ERROR: Node.js nu a fost găsit!"
    echo "Contactează suportul Hostinger pentru a instala Node.js"
    exit 1
fi

# Verifică dacă server/ există
if [ ! -d "server" ]; then
    echo "ERROR: Directorul server/ nu există!"
    echo "Rulează mai întâi: bash SETUP_SERVER.sh"
    exit 1
fi

cd server

# Verifică dacă node_modules există
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    NPM_PATH=$(which npm 2>/dev/null || find /usr -name npm 2>/dev/null | head -1)
    if [ -n "$NPM_PATH" ] && [ -f "$NPM_PATH" ]; then
        $NPM_PATH install
    else
        echo "ERROR: npm nu a fost găsit!"
        echo "Contactează suportul Hostinger"
        exit 1
    fi
fi

# Verifică dacă .env există
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << 'EOF'
DATABASE_URL=mysql://u328389087_sportisia:Csl19920903@localhost:3306/u328389087_sportisia
PORT=3001
NODE_ENV=production
EOF
fi

# Pornește backend-ul
echo "Starting backend server..."
$NODE_PATH index.js

