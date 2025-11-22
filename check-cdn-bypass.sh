#!/bin/bash

echo "=== Verificare CDN/Proxy în fața VPS-ului ==="
echo ""

# 1. Verifică IP-ul real al VPS-ului
PUBLIC_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip)
echo "1. IP VPS: $PUBLIC_IP"
echo ""

# 2. Verifică ce IP are DNS-ul
DNS_IP=$(dig +short sportisia.ro | tail -1)
echo "2. IP DNS: $DNS_IP"
echo ""

# 3. Testează direct pe IP-ul VPS (bypass DNS)
echo "3. Test direct pe IP VPS (bypass DNS și CDN):"
echo "   Test: curl -H 'Host: sportisia.ro' http://$PUBLIC_IP"
RESPONSE=$(curl -s -H "Host: sportisia.ro" "http://$PUBLIC_IP" | head -5)
echo "$RESPONSE"
echo ""

if echo "$RESPONSE" | grep -q "DOCTYPE html"; then
    if echo "$RESPONSE" | grep -q "Parked Domain\|sportisia"; then
        echo "   ⚠️  Primești pagina de parking chiar și pe IP direct!"
        echo "   Asta înseamnă că există un proxy în fața VPS-ului"
    else
        echo "   ✅ VPS-ul servește corect aplicația!"
        echo "   Problema este că CDN-ul interceptează traficul"
    fi
fi
echo ""

# 4. Verifică dacă există configurații speciale necesare
echo "4. Verificare configurații necesare:"
echo ""
echo "   În panoul Hostinger VPS:"
echo "   - Verifică dacă există o opțiune 'CDN' sau 'Proxy' care trebuie dezactivată"
echo "   - Sau verifică dacă trebuie să adaugi domeniul în lista de domenii permise"
echo "   - Verifică dacă există o secțiune 'Domain Management' în panoul VPS"
echo ""

# 5. Verifică dacă Nginx ascultă pe toate interfețele
echo "5. Verificare configurație Nginx:"
grep -E "listen|server_name" /etc/nginx/sites-available/sportisiaro | head -5
echo ""

# 6. Testează dacă Nginx răspunde pe IP direct
echo "6. Test Nginx pe IP direct (fără Host header):"
curl -s "http://$PUBLIC_IP" | head -5
echo ""

# 7. Verifică dacă există firewall care blochează
echo "7. Verificare firewall:"
if command -v ufw &> /dev/null; then
    ufw status | grep -E "80|443" || echo "   UFW nu blochează porturile 80/443"
elif command -v firewall-cmd &> /dev/null; then
    firewall-cmd --list-ports 2>/dev/null || echo "   Firewalld nu pare să blocheze"
else
    echo "   Nu s-a găsit firewall configurat"
fi
echo ""

echo "=== Diagnostic completat ==="
echo ""
echo "SOLUȚIE:"
echo "1. Dacă testul pe IP direct funcționează, problema este CDN-ul"
echo "2. În panoul Hostinger VPS, caută:"
echo "   - 'CDN Settings' sau 'Proxy Settings'"
echo "   - 'Domain Management' sau 'Website Management'"
echo "   - Dezactivează CDN sau configurează-l să treacă traficul la VPS"
echo "3. Sau contactează suportul Hostinger pentru a dezactiva CDN-ul pentru domeniu"

