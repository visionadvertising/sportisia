#!/bin/bash

echo "=== Fix Backend 500 Error ==="
echo ""

SERVER_DIR="/var/www/sportisiaro/server"

# 1. Verifică dacă .env există
echo "1. Verificare .env:"
if [ ! -f "$SERVER_DIR/.env" ]; then
    echo "   ⚠️  .env nu există - creez..."
    cat > "$SERVER_DIR/.env" << 'EOF'
DATABASE_URL=mysql://u328389087_sportisia:Csl19920903@localhost:3306/u328389087_sportisia
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://sportisia.ro
EOF
    echo "   ✅ .env creat"
else
    echo "   ✅ .env există"
fi
echo ""

# 2. Verifică dependențele
echo "2. Verificare dependențe:"
cd "$SERVER_DIR"
if [ ! -d "node_modules" ]; then
    echo "   ⚠️  node_modules nu există - instalez..."
    npm install
    echo "   ✅ Dependențe instalate"
else
    echo "   ✅ Dependențe există"
fi
echo ""

# 3. Verifică dacă baza de date este inițializată
echo "3. Inițializare baza de date:"
cd "$SERVER_DIR"
node -e "
import('mysql2/promise').then(async (mysql) => {
    const dbUrl = process.env.DATABASE_URL || 'mysql://u328389087_sportisia:Csl19920903@localhost:3306/u328389087_sportisia';
    const url = new URL(dbUrl.replace('mysql://', 'http://'));
    try {
        const conn = await mysql.default.createConnection({
            host: url.hostname,
            port: parseInt(url.port) || 3306,
            user: url.username,
            password: url.password,
            database: url.pathname.slice(1)
        });
        
        // Creează tabelul dacă nu există
        await conn.query(\`
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
            )
        \`);
        
        console.log('✅ Tabel creat sau deja există');
        await conn.end();
    } catch (e) {
        console.log('❌ Eroare:', e.message);
        process.exit(1);
    }
});
" 2>&1
echo ""

# 4. Restart backend cu PM2
echo "4. Restart backend:"
pm2 restart sportisiaro-api
echo ""

# 5. Așteaptă puțin și verifică status
sleep 2
echo "5. Status backend:"
pm2 status sportisiaro-api
echo ""

# 6. Testează endpoint-ul
echo "6. Test endpoint /api/health:"
sleep 1
curl -s http://localhost:3001/api/health | jq . 2>/dev/null || curl -s http://localhost:3001/api/health
echo ""
echo "---"

echo "7. Test endpoint /api/fields:"
curl -s http://localhost:3001/api/fields | jq . 2>/dev/null || curl -s http://localhost:3001/api/fields
echo ""

echo "=== ✅ Fix completat ==="
echo ""
echo "Dacă tot primești 500, verifică log-urile:"
echo "  pm2 logs sportisiaro-api --lines 50"

