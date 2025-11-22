#!/bin/bash

echo "=== Diagnostic Backend API ==="
echo ""

# 1. Verifică dacă backend-ul rulează
echo "1. Status PM2:"
pm2 status sportisiaro-api
echo ""

# 2. Verifică log-urile backend-ului
echo "2. Ultimele erori din log-uri backend:"
pm2 logs sportisiaro-api --lines 20 --nostream 2>/dev/null | tail -30
echo ""

# 3. Testează endpoint-ul health
echo "3. Test endpoint /api/health:"
curl -s http://localhost:3001/api/health | jq . 2>/dev/null || curl -s http://localhost:3001/api/health
echo ""
echo "---"

# 4. Testează endpoint-ul /api/fields
echo "4. Test endpoint /api/fields:"
curl -s http://localhost:3001/api/fields | jq . 2>/dev/null || curl -s http://localhost:3001/api/fields
echo ""
echo "---"

# 5. Verifică dacă .env există și este configurat
echo "5. Verificare .env:"
if [ -f "/var/www/sportisiaro/server/.env" ]; then
    echo "   ✅ .env există"
    echo "   Conținut (fără parolă):"
    grep -v "PASSWORD\|password" /var/www/sportisiaro/server/.env | head -5
else
    echo "   ❌ .env NU există!"
fi
echo ""

# 6. Verifică dacă baza de date este accesibilă
echo "6. Test conexiune baza de date:"
cd /var/www/sportisiaro/server
if [ -f ".env" ]; then
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
            console.log('✅ Conexiune baza de date reușită');
            await conn.end();
        } catch (e) {
            console.log('❌ Eroare conexiune:', e.message);
            process.exit(1);
        }
    });
    " 2>&1 || echo "   ⚠️  Nu s-a putut testa conexiunea"
else
    echo "   ⚠️  .env nu există, nu se poate testa conexiunea"
fi
echo ""

# 7. Verifică dacă tabelele există
echo "7. Verificare tabele în baza de date:"
cd /var/www/sportisiaro/server
if [ -f ".env" ]; then
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
            const [tables] = await conn.query('SHOW TABLES');
            console.log('Tabele găsite:', tables.length);
            tables.forEach(t => console.log('  -', Object.values(t)[0]));
            await conn.end();
        } catch (e) {
            console.log('❌ Eroare:', e.message);
        }
    });
    " 2>&1 || echo "   ⚠️  Nu s-a putut verifica tabelele"
fi
echo ""

# 8. Verifică procesul Node.js
echo "8. Procese Node.js:"
ps aux | grep "node.*index.js" | grep -v grep
echo ""

# 9. Verifică portul 3001
echo "9. Procese pe portul 3001:"
lsof -i :3001 2>/dev/null || netstat -tlnp | grep :3001
echo ""

echo "=== Diagnostic completat ==="

