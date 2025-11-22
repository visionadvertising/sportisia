#!/bin/bash

# Script complet pentru fixarea Nginx

DOMAIN="sportisia.ro"
NGINX_CONFIG="/etc/nginx/sites-available/sportisiaro"
NGINX_ENABLED="/etc/nginx/sites-enabled/sportisiaro"
DEFAULT_CONFIG="/etc/nginx/sites-enabled/default"

echo "=== Fix complet Nginx pentru $DOMAIN ==="

# 1. Backup configurația existentă
if [ -f "$NGINX_CONFIG" ]; then
    cp "$NGINX_CONFIG" "$NGINX_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✅ Backup creat"
fi

# 2. Creează/actualizează configurația
cat > "$NGINX_CONFIG" << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name sportisia.ro www.sportisia.ro;

    # Frontend static files
    root /var/www/sportisiaro/dist;
    index index.html;

    # Logs
    access_log /var/log/nginx/sportisiaro-access.log;
    error_log /var/log/nginx/sportisiaro-error.log;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

echo "✅ Configurația a fost creată/actualizată"

# 3. Șterge configurația default dacă există
if [ -L "$DEFAULT_CONFIG" ] || [ -f "$DEFAULT_CONFIG" ]; then
    rm -f "$DEFAULT_CONFIG"
    echo "✅ Configurația default a fost ștearsă"
fi

# 4. Creează symlink dacă nu există
if [ ! -L "$NGINX_ENABLED" ]; then
    ln -sf "$NGINX_CONFIG" "$NGINX_ENABLED"
    echo "✅ Symlink creat"
fi

# 5. Verifică că symlink-ul este corect
if [ -L "$NGINX_ENABLED" ]; then
    echo "✅ Symlink există și este corect"
else
    echo "❌ Eroare: Symlink nu există!"
    exit 1
fi

# 6. Testează configurația
echo ""
echo "=== Testare configurație ==="
nginx -t

if [ $? -ne 0 ]; then
    echo "❌ Eroare în configurație!"
    exit 1
fi

# 7. Restart Nginx
echo ""
echo "=== Restart Nginx ==="
systemctl restart nginx

if [ $? -ne 0 ]; then
    echo "❌ Eroare la restart Nginx!"
    systemctl status nginx --no-pager -l
    exit 1
fi

# 8. Verifică statusul
echo ""
echo "=== Status Nginx ==="
systemctl status nginx --no-pager -l | head -20

# 9. Verifică configurația activă
echo ""
echo "=== Configurații active ==="
ls -la /etc/nginx/sites-enabled/

# 10. Verifică dacă portul 80 este deschis
echo ""
echo "=== Verificare port 80 ==="
netstat -tlnp | grep :80 || ss -tlnp | grep :80

# 11. Testează local
echo ""
echo "=== Test local ==="
curl -I http://localhost 2>/dev/null | head -5

echo ""
echo "=== ✅ Gata! ==="
echo "Verifică: http://$DOMAIN"
echo "API: http://$DOMAIN/api/health"

