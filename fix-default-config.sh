#!/bin/bash

echo "=== Fix configurație default care interferează ==="

# 1. Verifică dacă există configurație default
if [ -f "/etc/nginx/sites-available/default" ]; then
    echo "⚠️  Configurația default există în sites-available"
    
    # Backup
    cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup.$(date +%Y%m%d_%H%M%S)
    
    # Modifică configurația default să nu interfereze
    # Sau șterge symlink-ul dacă există
    if [ -L "/etc/nginx/sites-enabled/default" ]; then
        rm -f /etc/nginx/sites-enabled/default
        echo "✅ Symlink default șters"
    fi
fi

# 2. Verifică dacă există alte configurații care ascultă pe port 80
echo ""
echo "=== Configurații care ascultă pe port 80 ==="
grep -r "listen 80" /etc/nginx/sites-enabled/ 2>/dev/null

# 3. Verifică ordinea de procesare (Nginx folosește prima configurație care se potrivește)
echo ""
echo "=== Ordine configurații (Nginx procesează în ordine alfabetică) ==="
ls -1 /etc/nginx/sites-enabled/

# 4. Asigură-te că sportisiaro este prima configurație
# Redenumește pentru a fi prima alfabetic
if [ -L "/etc/nginx/sites-enabled/sportisiaro" ]; then
    # Șterge vechiul symlink
    rm -f /etc/nginx/sites-enabled/sportisiaro
    
    # Creează un nou symlink cu nume care începe cu 'a' pentru a fi primul
    ln -sf /etc/nginx/sites-available/sportisiaro /etc/nginx/sites-enabled/00-sportisiaro
    
    echo "✅ Configurația redenumită la 00-sportisiaro (va fi procesată primul)"
fi

# 5. Verifică configurația Nginx principală
echo ""
echo "=== Verificare nginx.conf ==="
grep -E "include.*sites-enabled" /etc/nginx/nginx.conf

# 6. Testează configurația
echo ""
echo "=== Test configurație ==="
nginx -t

if [ $? -eq 0 ]; then
    echo ""
    echo "=== Restart Nginx ==="
    systemctl restart nginx
    echo "✅ Nginx restartat"
    
    echo ""
    echo "=== Status final ==="
    systemctl status nginx --no-pager -l | head -15
else
    echo "❌ Eroare în configurație!"
    exit 1
fi

echo ""
echo "=== ✅ Fix completat ==="
echo "Verifică: http://sportisia.ro"

