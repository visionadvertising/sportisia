#!/bin/bash

echo "=== Fix phpMyAdmin 502 Bad Gateway ==="
echo ""

# 1. Verifică și pornește PHP-FPM
echo "1. Verificare PHP-FPM..."
PHP_VERSION=$(php -r "echo PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION;" 2>/dev/null || echo "8.3")
PHP_SERVICE="php${PHP_VERSION}-fpm"

echo "   Versiune PHP detectată: $PHP_VERSION"
echo "   Serviciu PHP-FPM: $PHP_SERVICE"

# Verifică dacă serviciul există
if systemctl list-unit-files | grep -q "$PHP_SERVICE"; then
    echo "   ✅ Serviciul $PHP_SERVICE există"
    systemctl start "$PHP_SERVICE"
    systemctl enable "$PHP_SERVICE"
    systemctl status "$PHP_SERVICE" --no-pager -l | head -5
else
    echo "   ⚠️  Serviciul $PHP_SERVICE nu există, caută alternative..."
    # Caută orice serviciu PHP-FPM
    PHP_SERVICE=$(systemctl list-unit-files | grep php.*fpm | head -1 | awk '{print $1}')
    if [ -n "$PHP_SERVICE" ]; then
        echo "   Găsit: $PHP_SERVICE"
        systemctl start "$PHP_SERVICE"
        systemctl enable "$PHP_SERVICE"
    else
        echo "   ❌ Nu s-a găsit niciun serviciu PHP-FPM!"
        exit 1
    fi
fi
echo ""

# 2. Găsește socket-ul PHP-FPM
echo "2. Căutare socket PHP-FPM..."
PHP_SOCKET=$(ls /var/run/php/php*-fpm.sock 2>/dev/null | head -1)

if [ -z "$PHP_SOCKET" ]; then
    echo "   ⚠️  Socket nu a fost găsit, aștept 2 secunde..."
    sleep 2
    PHP_SOCKET=$(ls /var/run/php/php*-fpm.sock 2>/dev/null | head -1)
fi

if [ -n "$PHP_SOCKET" ]; then
    echo "   ✅ Socket găsit: $PHP_SOCKET"
    ls -la "$PHP_SOCKET"
else
    echo "   ❌ Socket PHP-FPM nu există!"
    echo "   Verifică log-urile PHP-FPM:"
    tail -10 /var/log/php*-fpm.log 2>/dev/null || echo "   Nu s-au găsit log-uri"
    exit 1
fi
echo ""

# 3. Verifică configurația Nginx actuală
echo "3. Verificare configurație Nginx..."
NGINX_CONF="/etc/nginx/sites-available/sportisiaro"

if ! grep -q "location /phpmyadmin" "$NGINX_CONF"; then
    echo "   ⚠️  Configurația phpMyAdmin nu există, adaug..."
    
    # Backup
    cp "$NGINX_CONF" "${NGINX_CONF}.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Adaugă configurația înainte de închiderea blocului server
    sed -i '/^}$/i\
    # phpMyAdmin\
    location /phpmyadmin {\
        alias /usr/share/phpmyadmin;\
        index index.php;\
        \
        location ~ \.php$ {\
            fastcgi_pass unix:'"$PHP_SOCKET"';\
            fastcgi_index index.php;\
            include fastcgi_params;\
            fastcgi_param SCRIPT_FILENAME $request_filename;\
        }\
    }\
' "$NGINX_CONF"
    echo "   ✅ Configurație adăugată"
else
    echo "   ✅ Configurația phpMyAdmin există"
    # Actualizează socket-ul dacă este greșit
    sed -i "s|unix:/var/run/php/php.*-fpm.sock|unix:$PHP_SOCKET|g" "$NGINX_CONF"
    echo "   ✅ Socket actualizat la: $PHP_SOCKET"
fi
echo ""

# 4. Verifică permisiunile
echo "4. Verificare permisiuni..."
# Asigură-te că www-data poate accesa socket-ul
chown www-data:www-data "$PHP_SOCKET" 2>/dev/null || true
chmod 666 "$PHP_SOCKET" 2>/dev/null || true
echo "   ✅ Permisiuni verificate"
echo ""

# 5. Testează configurația Nginx
echo "5. Testare configurație Nginx..."
nginx -t
if [ $? -ne 0 ]; then
    echo "   ❌ Eroare în configurația Nginx!"
    echo "   Verifică eroarea de mai sus"
    exit 1
fi
echo "   ✅ Configurație validă"
echo ""

# 6. Restart servicii
echo "6. Restart servicii..."
systemctl restart "$PHP_SERVICE" 2>/dev/null || systemctl restart php-fpm
systemctl restart nginx
echo "   ✅ Servicii restartate"
echo ""

# 7. Verificare finală
echo "7. Verificare finală..."
sleep 2

# Verifică status servicii
echo "   Status PHP-FPM:"
systemctl is-active "$PHP_SERVICE" 2>/dev/null && echo "   ✅ PHP-FPM rulează" || echo "   ❌ PHP-FPM nu rulează"

echo "   Status Nginx:"
systemctl is-active nginx && echo "   ✅ Nginx rulează" || echo "   ❌ Nginx nu rulează"

# Test local
echo ""
echo "   Test local phpMyAdmin:"
curl -I http://localhost/phpmyadmin 2>&1 | head -5
echo ""

# 8. Verifică log-urile pentru erori
echo "8. Ultimele erori din log-uri:"
echo "   Nginx error log:"
tail -5 /var/log/nginx/error.log 2>/dev/null | grep -i "phpmyadmin\|502\|fastcgi" || echo "   Nu s-au găsit erori relevante"

echo ""
echo "   PHP-FPM error log:"
tail -5 /var/log/php*-fpm.log 2>/dev/null | grep -i error || echo "   Nu s-au găsit erori"
echo ""

echo "=== ✅ Fix completat ==="
echo ""
echo "Accesează phpMyAdmin la:"
echo "  http://sportisia.ro/phpmyadmin"
echo ""
echo "Credențiale:"
echo "  Username: u328389087_sportisia"
echo "  Password: Csl19920903"
echo ""
echo "Dacă tot primești 502, verifică log-urile:"
echo "  tail -f /var/log/nginx/error.log"

