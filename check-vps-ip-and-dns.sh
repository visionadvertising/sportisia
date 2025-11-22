#!/bin/bash

echo "=== Verificare IP VPS și configurare DNS ==="
echo ""

# 1. Verifică IP-ul real al VPS-ului
echo "1. IP-uri ale VPS-ului:"
echo "   IP public (din ifconfig.me):"
PUBLIC_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip)
echo "   $PUBLIC_IP"
echo ""
echo "   IP-uri locale:"
hostname -I
echo ""

# 2. Verifică ce IP are DNS-ul
echo "2. Verificare DNS pentru sportisia.ro:"
DNS_IP=$(dig +short sportisia.ro | tail -1)
echo "   DNS pointează la: $DNS_IP"
echo "   IP VPS public: $PUBLIC_IP"
echo ""

if [ "$DNS_IP" != "$PUBLIC_IP" ]; then
    echo "   ⚠️  ⚠️  ⚠️  PROBLEMĂ: DNS-ul NU pointează la IP-ul VPS-ului!"
    echo "   DNS: $DNS_IP"
    echo "   VPS: $PUBLIC_IP"
    echo ""
    echo "   SOLUȚIE: Trebuie să actualizezi DNS-ul în panoul Hostinger"
    echo "   pentru a pointea la IP-ul VPS-ului: $PUBLIC_IP"
else
    echo "   ✅ DNS-ul pointează corect la IP-ul VPS-ului"
fi
echo ""

# 3. Verifică dacă există CDN/proxy în față
echo "3. Test direct pe IP-ul VPS (bypass DNS):"
echo "   Test pe $PUBLIC_IP cu Host header:"
curl -s -H "Host: sportisia.ro" "http://$PUBLIC_IP" | head -10
echo ""
echo "---"

# 4. Verifică configurația în panoul Hostinger
echo "4. Instrucțiuni pentru configurare DNS:"
echo ""
echo "   În panoul Hostinger:"
echo "   1. Intră în 'Domains' sau 'DNS Management'"
echo "   2. Selectează domeniul 'sportisia.ro'"
echo "   3. Găsește record-ul A pentru '@' (sau root)"
echo "   4. Actualizează IP-ul la: $PUBLIC_IP"
echo "   5. Salvează modificările"
echo ""
echo "   IMPORTANT: Dacă domeniul este gestionat de Hostinger,"
echo "   poate fi necesar să-l conectezi la VPS-ul tău în secțiunea"
echo "   'Websites' sau 'Hosting' din panou."
echo ""

# 5. Verifică dacă domeniul este conectat la VPS în panou
echo "5. Verificare configurație domeniu:"
echo "   Dacă domeniul este în panoul Hostinger, verifică:"
echo "   - Management > Websites > [site-ul tău]"
echo "   - Asigură-te că domeniul este conectat la VPS-ul corect"
echo "   - Sau că nu există o configurație de 'Parked Domain' activă"
echo ""

echo "=== Diagnostic completat ==="
echo ""
echo "REZOLVARE:"
echo "1. Actualizează DNS A record pentru '@' la IP: $PUBLIC_IP"
echo "2. Verifică în panoul Hostinger că domeniul nu este 'parked'"
echo "3. Conectează domeniul la VPS-ul tău în secțiunea Websites"
echo "4. Așteaptă 5-10 minute pentru propagare DNS"
echo "5. Testează din nou: curl -I http://sportisia.ro"

