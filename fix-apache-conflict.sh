#!/bin/bash

echo "=== Fix conflict Apache/Nginx ==="
echo ""

# 1. Oprește Apache dacă rulează
if systemctl is-active --quiet apache2 2>/dev/null; then
    echo "⚠️  Apache2 este activ - opresc..."
    systemctl stop apache2
    systemctl disable apache2
    echo "✅ Apache2 oprit și dezactivat"
elif systemctl is-active --quiet httpd 2>/dev/null; then
    echo "⚠️  Httpd este activ - opresc..."
    systemctl stop httpd
    systemctl disable httpd
    echo "✅ Httpd oprit și dezactivat"
else
    echo "✅ Apache nu rulează"
fi
echo ""

# 2. Verifică dacă Apache ocupă portul 80
APACHE_PID=$(lsof -t -i:80 2>/dev/null | head -1)
if [ -n "$APACHE_PID" ]; then
    PROCESS_NAME=$(ps -p $APACHE_PID -o comm= 2>/dev/null)
    if [[ "$PROCESS_NAME" == *"apache"* ]] || [[ "$PROCESS_NAME" == *"httpd"* ]]; then
        echo "⚠️  Apache ocupă portul 80 - opresc procesul..."
        kill -9 $APACHE_PID 2>/dev/null
        echo "✅ Proces oprit"
    fi
fi
echo ""

# 3. Asigură-te că Nginx rulează
if ! systemctl is-active --quiet nginx; then
    echo "⚠️  Nginx nu rulează - pornesc..."
    systemctl start nginx
    systemctl enable nginx
    echo "✅ Nginx pornit"
else
    echo "✅ Nginx rulează"
fi
echo ""

# 4. Verifică ce proces ascultă pe portul 80
echo "4. Proces care ascultă pe portul 80:"
lsof -i :80 2>/dev/null || netstat -tlnp | grep :80
echo ""

# 5. Restart Nginx pentru a fi sigur
echo "5. Restart Nginx..."
systemctl restart nginx
echo "✅ Nginx restartat"
echo ""

# 6. Test final
echo "6. Test final:"
curl -s -H "Host: sportisia.ro" http://localhost | head -10
echo ""

echo "=== ✅ Fix completat ==="

