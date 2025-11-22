#!/bin/bash

echo "=== Fix conexiune phpMyAdmin ==="
echo ""

PMA_CONFIG="/etc/phpmyadmin/config.inc.php"
DB_USER="u328389087_sportisia"
DB_PASS="Csl19920903"

# 1. Backup configurație
if [ -f "$PMA_CONFIG" ]; then
    cp "$PMA_CONFIG" "${PMA_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✅ Backup creat"
else
    echo "❌ Fișier de configurare nu există: $PMA_CONFIG"
    exit 1
fi

# 2. Actualizează controluser și controlpass
echo "2. Actualizare controluser și controlpass..."

# Elimină configurațiile vechi
sed -i "/\$cfg\['Servers'\]\[\$i\]\['controluser'\]/d" "$PMA_CONFIG"
sed -i "/\$cfg\['Servers'\]\[\$i\]\['controlpass'\]/d" "$PMA_CONFIG"
sed -i "/\$cfg\['Servers'\]\[\$i\]\['controlhost'\]/d" "$PMA_CONFIG"

# Adaugă configurațiile corecte după linia cu 'auth_type'
if grep -q "auth_type" "$PMA_CONFIG"; then
    # Găsește linia cu auth_type și adaugă după ea
    sed -i "/auth_type/a\\
\\\$cfg['Servers'][\\\$i]['controluser'] = '$DB_USER';\\
\\\$cfg['Servers'][\\\$i]['controlpass'] = '$DB_PASS';\\
\\\$cfg['Servers'][\\\$i]['controlhost'] = 'localhost';" "$PMA_CONFIG"
    echo "✅ Configurație controluser actualizată"
else
    echo "⚠️  Nu s-a găsit auth_type, adaug manual..."
    # Adaugă în secțiunea Servers
    sed -i "/\$cfg\['Servers'\]\[\$i\]\['host'\]/a\\
\\\$cfg['Servers'][\\\$i]['controluser'] = '$DB_USER';\\
\\\$cfg['Servers'][\\\$i]['controlpass'] = '$DB_PASS';\\
\\\$cfg['Servers'][\\\$i]['controlhost'] = 'localhost';" "$PMA_CONFIG"
fi
echo ""

# 3. Verifică dacă userul MySQL există și are permisiuni
echo "3. Verificare user MySQL..."
mysql -u root -p -e "SELECT User, Host FROM mysql.user WHERE User='$DB_USER';" 2>/dev/null || \
mysql -u root -e "SELECT User, Host FROM mysql.user WHERE User='$DB_USER';" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ User MySQL există"
else
    echo "⚠️  Nu s-a putut verifica userul (poate fi normal dacă nu ai acces root)"
fi
echo ""

# 4. Testează conexiunea cu credențialele
echo "4. Test conexiune cu credențialele..."
mysql -u "$DB_USER" -p"$DB_PASS" -e "SELECT 1;" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Conexiune reușită cu $DB_USER"
else
    echo "❌ Eroare la conexiune cu $DB_USER"
    echo "   Verifică că credențialele sunt corecte"
fi
echo ""

# 5. Alternativ: dezactivează controluser dacă nu este necesar
echo "5. Opțiune: Dezactivare controluser (dacă nu este necesar)..."
# Comentează liniile controluser dacă există probleme
# sed -i "s/\$cfg\['Servers'\]\[\$i\]\['controluser'\]/# &/" "$PMA_CONFIG"
# sed -i "s/\$cfg\['Servers'\]\[\$i\]\['controlpass'\]/# &/" "$PMA_CONFIG"

echo "   (Lăsat activ - poate fi comentat dacă e necesar)"
echo ""

# 6. Verifică configurația finală
echo "6. Verificare configurație finală..."
grep -A 3 "controluser\|controlpass" "$PMA_CONFIG" | head -10
echo ""

# 7. Restart PHP-FPM pentru a aplica modificările
echo "7. Restart PHP-FPM..."
PHP_VERSION=$(php -r "echo PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION;" 2>/dev/null || echo "8.3")
PHP_SERVICE="php${PHP_VERSION}-fpm"
systemctl restart "$PHP_SERVICE" 2>/dev/null || systemctl restart php-fpm
echo "✅ PHP-FPM restartat"
echo ""

echo "=== ✅ Fix completat ==="
echo ""
echo "Actualizat configurația phpMyAdmin să folosească:"
echo "  controluser: $DB_USER"
echo "  controlpass: $DB_PASS"
echo ""
echo "Reîncarcă pagina phpMyAdmin în browser."
echo ""
echo "Dacă tot primești eroare, poți dezactiva controluser completând"
echo "liniile respective în $PMA_CONFIG"

