# Fix Complet Nginx - sportisia.ro

## Problema
Pagina de parking apare în loc de aplicație.

## Soluție Rapidă

Rulează pe VPS:

```bash
cd /var/www/sportisiaro
git pull
chmod +x fix-nginx-complete.sh
./fix-nginx-complete.sh
```

## Ce face scriptul

1. ✅ Creează backup configurației existente
2. ✅ Creează configurația Nginx corectă pentru `sportisia.ro`
3. ✅ Șterge configurația default care cauzează pagina de parking
4. ✅ Creează symlink-ul corect
5. ✅ Testează configurația
6. ✅ Restart Nginx
7. ✅ Verifică statusul

## Verificare Manuală

După ce rulezi scriptul, verifică:

```bash
# Verifică configurația activă
cat /etc/nginx/sites-enabled/sportisiaro

# Verifică că default nu există
ls -la /etc/nginx/sites-enabled/

# Verifică statusul
systemctl status nginx

# Testează local
curl http://localhost
```

## Dacă tot nu funcționează

1. **Verifică că aplicația este build-ată:**
   ```bash
   ls -la /var/www/sportisiaro/dist/index.html
   ```

2. **Verifică permisiunile:**
   ```bash
   chown -R www-data:www-data /var/www/sportisiaro/dist
   chmod -R 755 /var/www/sportisiaro/dist
   ```

3. **Verifică log-urile Nginx:**
   ```bash
   tail -f /var/log/nginx/error.log
   tail -f /var/log/nginx/sportisiaro-error.log
   ```

4. **Verifică că backend-ul rulează:**
   ```bash
   pm2 status
   curl http://localhost:3001/api/health
   ```

