#!/bin/bash

echo "=== Configurare Nginx pentru a funcționa cu CDN/Proxy ==="
echo ""

NGINX_CONF="/etc/nginx/sites-available/sportisiaro"

# 1. Backup configurație
cp "$NGINX_CONF" "${NGINX_CONF}.backup.$(date +%Y%m%d_%H%M%S)"
echo "✅ Backup creat"

# 2. Verifică configurația actuală
echo ""
echo "2. Configurație actuală:"
grep -E "listen|server_name|real_ip" "$NGINX_CONF" | head -10
echo ""

# 3. Adaugă configurații pentru CDN/Proxy
echo "3. Actualizare configurație pentru CDN/Proxy..."

# Creează un fișier temporar cu configurația actualizată
cat > /tmp/nginx_sportisiaro_update.conf << 'EOF'
# Configurație pentru CDN/Proxy Hostinger
# Acceptă trafic de la CDN-uri și proxy-uri

# Setări pentru real IP (pentru CDN)
set_real_ip_from 0.0.0.0/0;
real_ip_header X-Forwarded-For;
real_ip_recursive on;

# Sau pentru Hostinger specific:
# set_real_ip_from 84.32.0.0/16;
# set_real_ip_from 185.230.0.0/16;
EOF

# Verifică dacă există deja set_real_ip
if grep -q "set_real_ip" "$NGINX_CONF"; then
    echo "   ⚠️  set_real_ip deja configurat"
else
    # Adaugă configurația înainte de server block
    sed -i '/^server {/i\
# Real IP configuration for CDN/Proxy\
set_real_ip_from 0.0.0.0/0;\
real_ip_header X-Forwarded-For;\
real_ip_recursive on;\
' "$NGINX_CONF"
    echo "   ✅ Adăugat configurație real_ip"
fi

# 4. Asigură-te că Nginx ascultă pe toate interfețele
if ! grep -q "listen.*0.0.0.0" "$NGINX_CONF"; then
    sed -i 's/listen 80;/listen 0.0.0.0:80;/' "$NGINX_CONF"
    echo "   ✅ Configurat listen pe 0.0.0.0:80"
fi

# 5. Adaugă header-e pentru CDN
if ! grep -q "X-Forwarded-Proto" "$NGINX_CONF"; then
    # Adaugă după location / {
    sed -i '/location \/ {/a\
        # Headers for CDN/Proxy\
        proxy_set_header X-Forwarded-Proto $scheme;\
        proxy_set_header X-Real-IP $remote_addr;\
' "$NGINX_CONF"
    echo "   ✅ Adăugat header-e pentru CDN"
fi

# 6. Testează configurația
echo ""
echo "4. Test configurație:"
nginx -t
if [ $? -eq 0 ]; then
    echo "   ✅ Configurație validă"
    echo ""
    echo "5. Restart Nginx:"
    systemctl restart nginx
    echo "   ✅ Nginx restartat"
else
    echo "   ❌ Eroare în configurație - reverting..."
    cp "${NGINX_CONF}.backup."* "$NGINX_CONF" 2>/dev/null
    systemctl restart nginx
    exit 1
fi

echo ""
echo "=== ✅ Configurare completată ==="
echo ""
echo "IMPORTANT: Dacă tot vezi pagina de parking, problema este la nivel de CDN."
echo "Trebuie să dezactivezi CDN-ul în panoul Hostinger sau să-l configurezi"
echo "să treacă traficul la VPS-ul tău."

