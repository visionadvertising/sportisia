#!/bin/bash

echo "=== Fix complet Nginx - Rezolvare definitivă ==="
echo ""

# 1. Verifică și șterge configurația default dacă este activă
echo "1. Verificare configurație default..."
if [ -L "/etc/nginx/sites-enabled/default" ]; then
    echo "   ⚠️  Default este activă - șterg symlink-ul"
    rm -f /etc/nginx/sites-enabled/default
    echo "   ✅ Default dezactivată"
else
    echo "   ✅ Default nu este activă"
fi
echo ""

# 2. Verifică ce este în /var/www/html
echo "2. Verificare /var/www/html..."
if [ -d "/var/www/html" ] && [ "$(ls -A /var/www/html 2>/dev/null)" ]; then
    echo "   ⚠️  /var/www/html conține fișiere!"
    echo "   Conținut:"
    ls -la /var/www/html/
    echo ""
    echo "   Mutăm conținutul pentru backup..."
    mkdir -p /var/www/html.backup
    mv /var/www/html/* /var/www/html.backup/ 2>/dev/null
    echo "   ✅ Conținut mutat în /var/www/html.backup"
else
    echo "   ✅ /var/www/html este gol sau nu există"
fi
echo ""

# 3. Asigură-te că configurația sportisiaro este activă și prima
echo "3. Verificare configurație sportisiaro..."
if [ ! -f "/etc/nginx/sites-available/sportisiaro" ]; then
    echo "   ❌ Configurația sportisiaro nu există!"
    exit 1
fi

# Șterge toate symlink-urile vechi
rm -f /etc/nginx/sites-enabled/sportisiaro
rm -f /etc/nginx/sites-enabled/00-sportisiaro

# Creează symlink nou cu prefix pentru a fi primul
ln -sf /etc/nginx/sites-available/sportisiaro /etc/nginx/sites-enabled/00-sportisiaro
echo "   ✅ Configurația sportisiaro activată ca 00-sportisiaro"
echo ""

# 4. Verifică configurația sportisiaro
echo "4. Verificare conținut configurație sportisiaro:"
cat /etc/nginx/sites-available/sportisiaro | grep -E "root|server_name" | head -5
echo ""

# 5. Verifică că directorul root există și are conținut
ROOT_DIR=$(grep "root " /etc/nginx/sites-available/sportisiaro | awk '{print $2}' | tr -d ';')
if [ -n "$ROOT_DIR" ]; then
    echo "5. Verificare director root: $ROOT_DIR"
    if [ -d "$ROOT_DIR" ]; then
        echo "   ✅ Director există"
        if [ -f "$ROOT_DIR/index.html" ]; then
            echo "   ✅ index.html există"
            echo "   Conținut index.html (primele 5 linii):"
            head -5 "$ROOT_DIR/index.html"
        else
            echo "   ❌ index.html NU există!"
        fi
    else
        echo "   ❌ Director NU există!"
    fi
else
    echo "   ⚠️  Nu s-a găsit root directory în configurație"
fi
echo ""

# 6. Verifică toate configurațiile active
echo "6. Configurații active:"
ls -la /etc/nginx/sites-enabled/
echo ""

# 7. Testează configurația
echo "7. Test configurație Nginx..."
nginx -t
if [ $? -ne 0 ]; then
    echo "   ❌ Eroare în configurație!"
    exit 1
fi
echo "   ✅ Configurație validă"
echo ""

# 8. Restart Nginx
echo "8. Restart Nginx..."
systemctl restart nginx
if [ $? -eq 0 ]; then
    echo "   ✅ Nginx restartat"
else
    echo "   ❌ Eroare la restart!"
    exit 1
fi
echo ""

# 9. Testează ce servește
echo "9. Test ce servește pentru sportisia.ro:"
RESPONSE=$(curl -s -H "Host: sportisia.ro" http://localhost | head -5)
echo "$RESPONSE"
echo ""

# 10. Verifică status
echo "10. Status Nginx:"
systemctl status nginx --no-pager -l | head -10
echo ""

echo "=== ✅ Fix completat ==="
echo ""
echo "Verifică site-ul:"
echo "  - http://sportisia.ro"
echo "  - https://sportisia.ro (dacă SSL este configurat)"
echo ""
echo "Dacă tot vezi pagina de parking:"
echo "  1. Șterge cache-ul browserului (Ctrl+Shift+Delete)"
echo "  2. Încearcă în mod incognito (Ctrl+Shift+N)"
echo "  3. Verifică DNS: dig sportisia.ro"
echo "  4. Așteaptă 5-10 minute pentru propagare DNS"

