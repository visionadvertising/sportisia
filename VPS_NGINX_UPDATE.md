# Actualizare Nginx pentru sportisia.ro

## Comenzi rapide pe VPS

### Opțiunea 1: Folosește scriptul automat

```bash
cd /var/www/sportisiaro
chmod +x update-nginx-domain.sh
./update-nginx-domain.sh
```

### Opțiunea 2: Manual

```bash
# Editează configurația
nano /etc/nginx/sites-available/sportisiaro
```

Schimbă:
```nginx
server_name papayawhip-narwhal-717195.hostingersite.com;
```

Cu:
```nginx
server_name sportisia.ro www.sportisia.ro;
```

Salvează (`Ctrl+X`, `Y`, `Enter`), apoi:

```bash
# Testează configurația
nginx -t

# Restart Nginx
systemctl restart nginx

# Verifică statusul
systemctl status nginx
```

### Opțiunea 3: Comandă directă (sed)

```bash
sed -i 's/server_name.*;/server_name sportisia.ro www.sportisia.ro;/' /etc/nginx/sites-available/sportisiaro
nginx -t && systemctl restart nginx
```

## Verificare

După actualizare, verifică:
- `http://sportisia.ro` - ar trebui să vezi aplicația
- `http://sportisia.ro/api/health` - ar trebui să vezi JSON cu "API is running"

## Dacă tot vezi pagina de parking

```bash
# Șterge configurația default
rm -f /etc/nginx/sites-enabled/default

# Restart Nginx
systemctl restart nginx
```

