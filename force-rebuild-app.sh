#!/bin/bash

echo "=== Rebuild complet aplicație ==="

cd /var/www/sportisiaro

# 1. Actualizează codul
echo "1. Actualizare cod..."
git pull

# 2. Instalează dependențele frontend
echo "2. Instalare dependențe frontend..."
npm install

# 3. Build frontend
echo "3. Build frontend..."
npm run build

# 4. Verifică build-ul
echo "4. Verificare build..."
if [ -f "dist/index.html" ]; then
    echo "✅ Build reușit - index.html există"
    ls -lh dist/index.html
else
    echo "❌ Build eșuat - index.html nu există!"
    exit 1
fi

# 5. Setează permisiunile corecte
echo "5. Setare permisiuni..."
chown -R www-data:www-data dist/
chmod -R 755 dist/

# 6. Instalează dependențele backend
echo "6. Instalare dependențe backend..."
cd server
npm install
cd ..

# 7. Restart backend
echo "7. Restart backend..."
pm2 restart sportisiaro-api || pm2 start server/index.js --name sportisiaro-api

# 8. Restart Nginx
echo "8. Restart Nginx..."
systemctl restart nginx

echo ""
echo "=== ✅ Rebuild completat ==="
echo "Verifică: http://sportisia.ro"
echo "API: http://sportisia.ro/api/health"

