#!/bin/bash

echo "=== Creare baza de date MySQL ==="
echo ""

# Credențiale din .env sau default
DB_USER="u328389087_sportisia"
DB_PASS="Csl19920903"
DB_NAME="u328389087_sportisia"
DB_HOST="localhost"
DB_PORT="3306"

echo "1. Verificare conexiune MySQL:"
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" -e "SELECT 1;" 2>&1
if [ $? -ne 0 ]; then
    echo "   ⚠️  Nu se poate conecta cu aceste credențiale"
    echo "   Încearcă cu root sau alt user MySQL:"
    read -p "   MySQL root password (sau Enter pentru a încerca fără parolă): " ROOT_PASS
    if [ -z "$ROOT_PASS" ]; then
        MYSQL_CMD="mysql -u root"
    else
        MYSQL_CMD="mysql -u root -p$ROOT_PASS"
    fi
else
    MYSQL_CMD="mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS"
    echo "   ✅ Conexiune reușită"
fi
echo ""

echo "2. Verificare baze de date existente:"
$MYSQL_CMD -e "SHOW DATABASES;" 2>&1 | grep -E "Database|$DB_NAME"
echo ""

echo "3. Creare baza de date (dacă nu există):"
$MYSQL_CMD -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ Baza de date creată sau deja există"
else
    echo "   ❌ Eroare la crearea bazei de date"
    echo ""
    echo "   Încearcă manual:"
    echo "   mysql -u root -p"
    echo "   CREATE DATABASE \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    exit 1
fi
echo ""

echo "4. Verificare permisiuni utilizator:"
$MYSQL_CMD -e "GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'localhost';" 2>&1
$MYSQL_CMD -e "FLUSH PRIVILEGES;" 2>&1
echo "   ✅ Permisiuni actualizate"
echo ""

echo "5. Creare tabel sports_fields:"
$MYSQL_CMD "$DB_NAME" << 'SQL'
CREATE TABLE IF NOT EXISTS sports_fields (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    sport VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    has_parking BOOLEAN DEFAULT FALSE,
    has_shower BOOLEAN DEFAULT FALSE,
    has_changing_room BOOLEAN DEFAULT FALSE,
    has_air_conditioning BOOLEAN DEFAULT FALSE,
    has_lighting BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL

if [ $? -eq 0 ]; then
    echo "   ✅ Tabel creat sau deja există"
else
    echo "   ❌ Eroare la crearea tabelului"
    exit 1
fi
echo ""

echo "6. Verificare tabel:"
$MYSQL_CMD "$DB_NAME" -e "SHOW TABLES;" 2>&1
echo ""

echo "7. Test conexiune din Node.js:"
cd /var/www/sportisiaro/server
node -e "
import('mysql2/promise').then(async (mysql) => {
    try {
        const conn = await mysql.default.createConnection({
            host: 'localhost',
            port: 3306,
            user: '$DB_USER',
            password: '$DB_PASS',
            database: '$DB_NAME'
        });
        const [rows] = await conn.query('SELECT COUNT(*) as count FROM sports_fields');
        console.log('✅ Conexiune reușită! Tabelul are', rows[0].count, 'înregistrări');
        await conn.end();
    } catch (e) {
        console.log('❌ Eroare:', e.message);
        process.exit(1);
    }
});
" 2>&1
echo ""

echo "=== ✅ Baza de date creată și configurată ==="
echo ""
echo "Acum restart backend:"
echo "  pm2 restart sportisiaro-api"
echo ""
echo "Test endpoint:"
echo "  curl http://localhost:3001/api/fields"

