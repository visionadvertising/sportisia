#!/bin/bash

# Script pentru actualizarea domeniului în configurația Nginx

DOMAIN="sportisia.ro"
NGINX_CONFIG="/etc/nginx/sites-available/sportisiaro"

echo "=== Actualizare configurație Nginx pentru $DOMAIN ==="

# Backup configurația existentă
cp "$NGINX_CONFIG" "$NGINX_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"

# Actualizează server_name
sed -i "s/server_name.*;/server_name $DOMAIN www.$DOMAIN;/" "$NGINX_CONFIG"

echo "✅ Configurația a fost actualizată"
echo ""
echo "Configurația actualizată:"
grep "server_name" "$NGINX_CONFIG"

echo ""
echo "=== Testare configurație ==="
nginx -t

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Configurația este validă"
    echo ""
    echo "=== Restart Nginx ==="
    systemctl restart nginx
    echo "✅ Nginx a fost restartat"
    echo ""
    echo "=== Status Nginx ==="
    systemctl status nginx --no-pager -l
else
    echo "❌ Eroare în configurație! Restaurează backup-ul:"
    echo "cp $NGINX_CONFIG.backup.* $NGINX_CONFIG"
    exit 1
fi

echo ""
echo "=== Verificare configurație finală ==="
cat "$NGINX_CONFIG"

