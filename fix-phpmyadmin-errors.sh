#!/bin/bash

echo "=== Fix erori phpMyAdmin ==="
echo ""

# 1. Verifică extensiile PHP necesare
echo "1. Verificare extensii PHP..."
REQUIRED_EXTENSIONS=("mysqli" "mbstring" "xml" "zip" "gd" "curl" "json")

for ext in "${REQUIRED_EXTENSIONS[@]}"; do
    if php -m | grep -q "^$ext$"; then
        echo "   ✅ $ext instalat"
    else
        echo "   ⚠️  $ext LIPSEȘTE - instalez..."
        apt install -y php${PHP_VERSION}-${ext} 2>/dev/null || apt install -y php-${ext}
    fi
done
echo ""

# 2. Verifică și fixează permisiunile
echo "2. Verificare permisiuni..."
PMA_DIR="/usr/share/phpmyadmin"
if [ -d "$PMA_DIR" ]; then
    chown -R www-data:www-data "$PMA_DIR"
    chmod -R 755 "$PMA_DIR"
    echo "   ✅ Permisiuni actualizate pentru $PMA_DIR"
else
    echo "   ⚠️  Directorul phpMyAdmin nu există la $PMA_DIR"
fi
echo ""

# 3. Verifică configurația phpMyAdmin
echo "3. Verificare configurație phpMyAdmin..."
PMA_CONFIG="/etc/phpmyadmin/config.inc.php"

if [ -f "$PMA_CONFIG" ]; then
    echo "   ✅ Fișier de configurare există"
    
    # Verifică dacă există blowfish_secret
    if ! grep -q "blowfish_secret" "$PMA_CONFIG"; then
        echo "   ⚠️  blowfish_secret lipsește - adaug..."
        BLOWFISH_SECRET=$(openssl rand -base64 32)
        sed -i "/\?>/i\\\$cfg['blowfish_secret'] = '$BLOWFISH_SECRET';" "$PMA_CONFIG"
        echo "   ✅ blowfish_secret adăugat"
    else
        echo "   ✅ blowfish_secret există"
    fi
else
    echo "   ⚠️  Fișier de configurare nu există"
fi
echo ""

# 4. Verifică și fixează upload_max_filesize și post_max_size
echo "4. Verificare setări PHP pentru upload..."
PHP_INI=$(php --ini | grep "Loaded Configuration File" | awk '{print $4}')

if [ -n "$PHP_INI" ] && [ -f "$PHP_INI" ]; then
    # Backup
    cp "$PHP_INI" "${PHP_INI}.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Actualizează setările
    sed -i 's/^upload_max_filesize = .*/upload_max_filesize = 64M/' "$PHP_INI"
    sed -i 's/^post_max_size = .*/post_max_size = 64M/' "$PHP_INI"
    sed -i 's/^memory_limit = .*/memory_limit = 256M/' "$PHP_INI"
    
    echo "   ✅ Setări PHP actualizate"
    
    # Restart PHP-FPM
    PHP_VERSION=$(php -r "echo PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION;" 2>/dev/null || echo "8.3")
    PHP_SERVICE="php${PHP_VERSION}-fpm"
    systemctl restart "$PHP_SERVICE" 2>/dev/null || systemctl restart php-fpm
    echo "   ✅ PHP-FPM restartat"
else
    echo "   ⚠️  Nu s-a găsit php.ini"
fi
echo ""

# 5. Verifică erori în log-uri
echo "5. Verificare erori în log-uri..."
echo "   Ultimele erori PHP:"
tail -10 /var/log/php*-fpm.log 2>/dev/null | grep -i error || echo "   Nu s-au găsit erori"
echo ""

# 6. Verifică dacă există directorul tmp pentru phpMyAdmin
echo "6. Verificare director tmp..."
PMA_TMP="/var/lib/phpmyadmin/tmp"
if [ ! -d "$PMA_TMP" ]; then
    mkdir -p "$PMA_TMP"
    chown www-data:www-data "$PMA_TMP"
    chmod 777 "$PMA_TMP"
    echo "   ✅ Director tmp creat"
else
    chown www-data:www-data "$PMA_TMP"
    chmod 777 "$PMA_TMP"
    echo "   ✅ Director tmp există și are permisiuni corecte"
fi
echo ""

# 7. Verifică configurația Nginx pentru phpMyAdmin
echo "7. Verificare configurație Nginx..."
if grep -q "location /phpmyadmin" /etc/nginx/sites-available/sportisiaro; then
    echo "   ✅ Configurația phpMyAdmin există în Nginx"
else
    echo "   ⚠️  Configurația phpMyAdmin lipsește din Nginx"
fi
echo ""

# 8. Testează conexiunea la baza de date
echo "8. Test conexiune baza de date..."
mysql -u u328389087_sportisia -pCsl19920903 -e "SELECT 1;" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "   ✅ Conexiune la baza de date reușită"
else
    echo "   ⚠️  Eroare la conexiunea la baza de date"
fi
echo ""

echo "=== ✅ Verificare completă ==="
echo ""
echo "Dacă tot vezi erori în phpMyAdmin, spune-mi exact ce erori sunt"
echo "și le pot rezolva specific."

