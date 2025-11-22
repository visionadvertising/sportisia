#!/bin/bash

echo "=== Diagnostic complet configurații Nginx ==="
echo ""

# 1. Verifică ce este în /var/www/html
echo "1. Conținut /var/www/html:"
if [ -d "/var/www/html" ]; then
    ls -la /var/www/html/
    echo ""
    if [ -f "/var/www/html/index.html" ]; then
        echo "   ⚠️  EXISTĂ index.html în /var/www/html!"
        head -10 /var/www/html/index.html
    fi
else
    echo "   ✅ /var/www/html nu există"
fi
echo ""

# 2. Verifică configurația default
echo "2. Configurația default:"
if [ -f "/etc/nginx/sites-available/default" ]; then
    echo "   ⚠️  EXISTĂ configurație default!"
    echo "   Conținut:"
    cat /etc/nginx/sites-available/default | grep -A 10 "server {"
    echo ""
    if [ -L "/etc/nginx/sites-enabled/default" ]; then
        echo "   ⚠️  ⚠️  ⚠️  DEFAULT ESTE ACTIVĂ (symlink există)!"
    else
        echo "   ✅ Default nu este activă"
    fi
else
    echo "   ✅ Nu există configurație default"
fi
echo ""

# 3. Verifică toate configurațiile active
echo "3. Toate configurațiile active:"
ls -la /etc/nginx/sites-enabled/
echo ""

# 4. Verifică configurația sportisiaro
echo "4. Configurația sportisiaro:"
if [ -f "/etc/nginx/sites-available/sportisiaro" ]; then
    cat /etc/nginx/sites-available/sportisiaro
else
    echo "   ❌ Nu există!"
fi
echo ""

# 5. Verifică ce root directory folosește fiecare configurație
echo "5. Root directories din toate configurațiile:"
grep -r "root " /etc/nginx/sites-enabled/ 2>/dev/null
echo ""

# 6. Verifică ce server_name are fiecare configurație
echo "6. Server names din toate configurațiile:"
grep -r "server_name " /etc/nginx/sites-enabled/ 2>/dev/null
echo ""

# 7. Testează ce servește pentru sportisia.ro
echo "7. Test ce servește pentru sportisia.ro:"
curl -s -H "Host: sportisia.ro" http://localhost | head -30
echo ""
echo "---"

# 8. Testează ce servește fără Host header
echo "8. Test ce servește fără Host header (default):"
curl -s http://localhost | head -30
echo ""

# 9. Verifică dacă există configurații în conf.d
echo "9. Configurații în /etc/nginx/conf.d/:"
ls -la /etc/nginx/conf.d/ 2>/dev/null || echo "   Nu există conf.d"
if [ -d "/etc/nginx/conf.d" ] && [ "$(ls -A /etc/nginx/conf.d)" ]; then
    echo "   ⚠️  EXISTĂ configurații în conf.d:"
    cat /etc/nginx/conf.d/*.conf 2>/dev/null | grep -A 5 "server {"
fi
echo ""

# 10. Verifică nginx.conf principal
echo "10. Include-uri în nginx.conf:"
grep -E "include|root" /etc/nginx/nginx.conf | grep -v "^#"
echo ""

echo "=== Diagnostic completat ==="

