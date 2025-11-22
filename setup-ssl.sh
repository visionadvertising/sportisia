#!/bin/bash

echo "=== Configurare SSL cu Let's Encrypt ==="
echo ""

DOMAIN="sportisia.ro"
EMAIL="your_email@example.com"  # Schimbă cu email-ul tău real

# 1. Instalează Certbot
echo "1. Instalare Certbot..."
apt update
apt install -y certbot python3-certbot-nginx
echo "✅ Certbot instalat"
echo ""

# 2. Verifică configurația Nginx
echo "2. Verificare configurație Nginx..."
NGINX_CONF="/etc/nginx/sites-available/sportisiaro"

if [ ! -f "$NGINX_CONF" ]; then
    echo "❌ Configurația Nginx nu există!"
    exit 1
fi

# Verifică că server_name este corect
if ! grep -q "server_name.*$DOMAIN" "$NGINX_CONF"; then
    echo "⚠️  server_name nu conține $DOMAIN, actualizez..."
    sed -i "s/server_name.*/server_name $DOMAIN www.$DOMAIN;/" "$NGINX_CONF
    systemctl restart nginx
fi

echo "✅ Configurația Nginx verificată"
echo ""

# 3. Obține certificat SSL
echo "3. Obținere certificat SSL pentru $DOMAIN și www.$DOMAIN..."
echo "   IMPORTANT: Înlocuiește 'your_email@example.com' cu email-ul tău real în script!"
echo "   Sau rulează manual:"
echo "   certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL"
echo ""

read -p "Introdu email-ul tău pentru Let's Encrypt (sau apasă Enter pentru a continua cu email default): " USER_EMAIL

if [ -n "$USER_EMAIL" ]; then
    EMAIL="$USER_EMAIL"
fi

echo "   Obțin certificat cu email: $EMAIL"
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --email "$EMAIL" --redirect

if [ $? -eq 0 ]; then
    echo "✅ Certificat SSL obținut cu succes!"
else
    echo "❌ Eroare la obținerea certificatului SSL"
    echo "   Verifică că:"
    echo "   1. DNS-ul pentru $DOMAIN pointează la acest server"
    echo "   2. Portul 80 este deschis în firewall"
    echo "   3. Nginx rulează și servește site-ul pe HTTP"
    exit 1
fi
echo ""

# 4. Verifică configurația SSL în Nginx
echo "4. Verificare configurație SSL..."
if grep -q "listen 443" "$NGINX_CONF"; then
    echo "✅ Configurația SSL a fost adăugată în Nginx"
else
    echo "⚠️  Configurația SSL nu a fost adăugată automat"
    echo "   Verifică manual configurația Nginx"
fi
echo ""

# 5. Testează configurația Nginx
echo "5. Testare configurație Nginx..."
nginx -t
if [ $? -eq 0 ]; then
    systemctl reload nginx
    echo "✅ Nginx reîncărcat cu succes"
else
    echo "❌ Eroare în configurația Nginx!"
    exit 1
fi
echo ""

# 6. Configurează auto-renewal
echo "6. Configurare auto-renewal pentru certificat..."
# Certbot configurează automat cron job pentru renewal
# Verifică dacă există
if [ -f "/etc/cron.d/certbot" ]; then
    echo "✅ Auto-renewal deja configurat"
else
    echo "⚠️  Auto-renewal nu este configurat, adaug manual..."
    # Creează un cron job pentru renewal
    echo "0 0,12 * * * root certbot renew --quiet" > /etc/cron.d/certbot
    echo "✅ Auto-renewal configurat"
fi
echo ""

# 7. Testează renewal
echo "7. Testare renewal (dry-run)..."
certbot renew --dry-run
if [ $? -eq 0 ]; then
    echo "✅ Test renewal reușit"
else
    echo "⚠️  Test renewal a eșuat, verifică configurația"
fi
echo ""

# 8. Verificare finală
echo "8. Verificare finală..."
echo "   Test SSL local:"
curl -I https://localhost 2>&1 | head -5 || echo "   (Test local poate eșua, e normal)"
echo ""

echo "=== ✅ Configurare SSL completă ==="
echo ""
echo "Site-ul tău este acum accesibil la:"
echo "  https://$DOMAIN"
echo "  https://www.$DOMAIN"
echo ""
echo "HTTP va fi redirecționat automat la HTTPS."
echo ""
echo "Certificatul va fi reînnoit automat înainte de expirare."
echo ""
echo "Pentru a verifica statusul certificatului:"
echo "  certbot certificates"
echo ""
echo "Pentru a testa renewal manual:"
echo "  certbot renew --dry-run"

