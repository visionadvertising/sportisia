#!/bin/bash

echo "=== Diagnostic Nginx Complet ==="
echo ""

# 1. Verifică configurațiile active
echo "1. Configurații active:"
ls -la /etc/nginx/sites-enabled/
echo ""

# 2. Verifică server_name în toate configurațiile
echo "2. Server names în configurații:"
for config in /etc/nginx/sites-enabled/*; do
    if [ -f "$config" ] || [ -L "$config" ]; then
        echo "--- $config ---"
        grep -E "server_name|listen" "$config" | head -5
        echo ""
    fi
done

# 3. Verifică dacă există configurații în sites-available care nu sunt enabled
echo "3. Configurații disponibile dar neactive:"
ls -la /etc/nginx/sites-available/ | grep -v sportisiaro
echo ""

# 4. Testează configurația
echo "4. Test configurație Nginx:"
nginx -t
echo ""

# 5. Verifică statusul Nginx
echo "5. Status Nginx:"
systemctl status nginx --no-pager -l | head -15
echo ""

# 6. Verifică dacă aplicația există
echo "6. Verificare aplicație:"
echo "Dist directory:"
ls -la /var/www/sportisiaro/dist/ | head -10
echo ""
echo "Index.html exists:"
test -f /var/www/sportisiaro/dist/index.html && echo "✅ index.html există" || echo "❌ index.html NU există"
echo ""

# 7. Verifică permisiunile
echo "7. Permisiuni:"
ls -ld /var/www/sportisiaro/dist
ls -l /var/www/sportisiaro/dist/index.html
echo ""

# 8. Testează local
echo "8. Test local (curl localhost):"
curl -I http://localhost 2>&1 | head -10
echo ""

# 9. Verifică ce servește Nginx pentru domeniul sportisia.ro
echo "9. Test cu Host header:"
curl -I -H "Host: sportisia.ro" http://localhost 2>&1 | head -10
echo ""

# 10. Verifică log-urile recente
echo "10. Ultimele erori din log:"
tail -10 /var/log/nginx/error.log 2>/dev/null || echo "Nu există erori recente"
echo ""

# 11. Verifică dacă backend-ul rulează
echo "11. Status backend:"
pm2 status 2>/dev/null || echo "PM2 nu rulează sau nu este instalat"
echo ""

# 12. Testează backend-ul direct
echo "12. Test backend direct:"
curl http://localhost:3001/api/health 2>&1 | head -5
echo ""

# 13. Verifică ce procese ascultă pe port 80
echo "13. Procese pe port 80:"
netstat -tlnp | grep :80 || ss -tlnp | grep :80
echo ""

echo "=== Diagnostic completat ==="

