#!/bin/bash

echo "=== Diagnostic probleme la nivel de server ==="
echo ""

# 1. Verifică ce procese ascultă pe portul 80
echo "1. Procese care ascultă pe portul 80:"
lsof -i :80 2>/dev/null || netstat -tlnp | grep :80
echo ""

# 2. Verifică dacă Apache rulează
echo "2. Verificare Apache:"
if systemctl is-active --quiet apache2 2>/dev/null || systemctl is-active --quiet httpd 2>/dev/null; then
    echo "   ⚠️  ⚠️  ⚠️  APACHE ESTE ACTIV!"
    systemctl status apache2 2>/dev/null || systemctl status httpd 2>/dev/null | head -5
    echo ""
    echo "   Verifică configurațiile Apache:"
    ls -la /etc/apache2/sites-enabled/ 2>/dev/null || ls -la /etc/httpd/conf.d/ 2>/dev/null
else
    echo "   ✅ Apache nu rulează"
fi
echo ""

# 3. Verifică dacă există LiteSpeed sau alt web server
echo "3. Verificare alte web servers:"
ps aux | grep -E "litespeed|httpd|apache|lighttpd" | grep -v grep
echo ""

# 4. Verifică configurația Nginx completă
echo "4. Configurație Nginx completă pentru sportisiaro:"
nginx -T 2>/dev/null | grep -A 30 "server_name.*sportisia" || cat /etc/nginx/sites-available/sportisiaro
echo ""

# 5. Testează direct pe IP-ul serverului
echo "5. Test direct pe IP server:"
SERVER_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || hostname -I | awk '{print $1}')
echo "   IP server: $SERVER_IP"
echo "   Test cu IP direct:"
curl -s -H "Host: sportisia.ro" "http://$SERVER_IP" | head -20
echo ""
echo "   Test fără Host header:"
curl -s "http://$SERVER_IP" | head -20
echo ""

# 6. Verifică dacă există firewall care redirectează
echo "6. Verificare firewall/iptables:"
iptables -t nat -L -n -v 2>/dev/null | grep -E "80|443" || echo "   Nu s-au găsit reguli relevante"
echo ""

# 7. Verifică dacă există Cloudflare sau alt CDN
echo "7. Verificare DNS și CDN:"
dig +short sportisia.ro
echo ""
nslookup sportisia.ro | grep -A 5 "Name:"
echo ""

# 8. Testează cu curl direct pe domeniu
echo "8. Test direct pe domeniu:"
curl -v http://sportisia.ro 2>&1 | head -30
echo ""

# 9. Verifică log-urile Nginx pentru accesări
echo "9. Ultimele accesări în log-uri Nginx:"
tail -20 /var/log/nginx/access.log 2>/dev/null || echo "   Nu s-au găsit log-uri"
echo ""

# 10. Verifică dacă există configurații în /etc/nginx/conf.d sau alte locații
echo "10. Configurații în locații alternative:"
find /etc/nginx -name "*.conf" -type f | xargs grep -l "sportisia\|80\|default" 2>/dev/null
echo ""

# 11. Verifică dacă există un reverse proxy configurat
echo "11. Verificare reverse proxy:"
grep -r "proxy_pass\|proxy_set_header" /etc/nginx/ 2>/dev/null | head -10
echo ""

# 12. Verifică ce servește Nginx când accesezi direct localhost
echo "12. Test localhost direct:"
curl -s http://localhost | head -20
echo ""

# 13. Verifică header-ele HTTP
echo "13. Header-e HTTP pentru sportisia.ro:"
curl -I http://sportisia.ro 2>&1 | head -20
echo ""

echo "=== Diagnostic completat ==="
echo ""
echo "IMPORTANT: Dacă vezi că Apache rulează sau există alt web server,"
echo "acesta poate intercepta traficul înainte să ajungă la Nginx!"

