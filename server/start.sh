#!/bin/bash

# Script pentru a porni backend-ul automat
cd "$(dirname "$0")"

# Verifică dacă .env există, dacă nu, îl creează
if [ ! -f .env ]; then
    cat > .env << 'EOF'
DATABASE_URL=mysql://u328389087_sportisia:Csl19920903@localhost:3306/u328389087_sportisia
PORT=3001
NODE_ENV=production
EOF
fi

# Creează directorul pentru log-uri
mkdir -p logs

# Instalează dependențele dacă nu există node_modules
if [ ! -d "node_modules" ]; then
    npm install
fi

# Verifică dacă PM2 este instalat
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Oprește procesul vechi dacă există
pm2 delete sportisiaro-api 2>/dev/null || true

# Pornește backend-ul
pm2 start index.js --name sportisiaro-api

# Salvează configurația PM2
pm2 save

echo "Backend started successfully!"
pm2 status

