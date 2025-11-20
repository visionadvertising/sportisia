# 🚀 Ghid Deploy pe Hostinger

## Cum funcționează deploy-ul pe Hostinger

Pe Hostinger, deploy-ul poate fi:
1. **Automat** - când se face push pe GitHub (dacă este configurat)
2. **Manual** - declanșat din panoul de control

## Verifică dacă deploy-ul automat este configurat

1. **Intră în panoul Hostinger**
2. **Navighează la:** Management > Websites > [site-ul tău]
3. **Caută secțiunea:**
   - "Git Integration" sau
   - "Deploy" sau
   - "CI/CD" sau
   - "Build Settings"

4. **Verifică dacă există:**
   - Repository conectat (GitHub)
   - Branch configurat (de obicei `main`)
   - Build command configurat (de obicei `npm run build`)
   - Start command configurat (de obicei `npm start`)

## Dacă deploy-ul automat NU este configurat

### Opțiunea 1: Configurează deploy automat (Recomandat)

1. **Intră în panoul Hostinger**
2. **Navighează la:** Management > Websites > [site-ul tău] > Git Integration (sau Deploy)
3. **Conectează repository-ul:**
   - Repository: `visionadvertising/sportisia`
   - Branch: `main`
   - Build command: `npm run build`
   - Start command: `npm start`
   - Root directory: `/` (sau lasă gol)

4. **Salvează configurația**

După configurare, fiecare push pe `main` va declanșa automat deploy-ul.

### Opțiunea 2: Deploy manual

1. **Intră în panoul Hostinger**
2. **Navighează la:** Management > Websites > [site-ul tău]
3. **Caută butonul:**
   - "Deploy" sau
   - "Rebuild" sau
   - "Build Now"

4. **Click pe buton pentru a declanșa deploy-ul manual**

## Pași pentru deploy

### Pasul 1: Asigură-te că codul este pe GitHub

Verifică că toate modificările sunt push-uite:
```bash
git status
git push
```

### Pasul 2: Setează variabilele de mediu

Înainte de deploy, asigură-te că ai setat:
- **DATABASE_URL** - connection string-ul MySQL

**Unde să le setezi:**
1. **Intră în panoul Hostinger**
2. **Navighează la:** Management > Websites > [site-ul tău] > Environment Variables (sau Build Settings)
3. **Adaugă:**
   - Nume: `DATABASE_URL`
   - Valoare: `mysql://u328389087_sportisiaro_user:parola123@localhost:3306/u328389087_sportisiaro`
   (Înlocuiește cu datele tale reale)

### Pasul 3: Declanșează deploy-ul

**Dacă deploy-ul automat este configurat:**
- Fă push pe GitHub: `git push`
- Deploy-ul se va declanșa automat

**Dacă deploy-ul automat NU este configurat:**
- Intră în panoul Hostinger
- Click pe butonul "Deploy" sau "Rebuild"

### Pasul 4: Verifică build-ul

După deploy, verifică:
1. **Status build** - în panoul Hostinger, vezi dacă build-ul a reușit
2. **Loguri** - verifică logurile pentru erori
3. **Aplicația** - accesează site-ul și verifică dacă funcționează

### Pasul 5: Creează tabelele în baza de date

După deploy reușit, creează tabelele:

**Via SSH:**
```bash
cd ~/domains/lavender-cassowary-938357.hostingersite.com/public_html
npm run db:push
```

**Via API:**
După deploy, accesează:
```
https://lavender-cassowary-938357.hostingersite.com/api/setup
```

## Probleme comune

### Build-ul eșuează

**Cauze posibile:**
- `DATABASE_URL` nu este setat corect
- Dependențe lipsă
- Erori de compilare

**Soluție:**
1. Verifică logurile de build în panoul Hostinger
2. Verifică că `DATABASE_URL` este setat corect
3. Verifică că toate dependențele sunt în `package.json`

### Aplicația nu pornește

**Cauze posibile:**
- Port incorect
- `DATABASE_URL` nu este setat
- Erori la runtime

**Soluție:**
1. Verifică logurile aplicației
2. Verifică că `DATABASE_URL` este setat
3. Verifică că port-ul este corect (de obicei 3001 sau 3000)

### Datele nu se salvează

**Cauze posibile:**
- `DATABASE_URL` este setat la SQLite (vechi)
- Tabelele nu există în baza de date
- Erori de conexiune la MySQL

**Soluție:**
1. Verifică că `DATABASE_URL` este setat la MySQL
2. Rulează `npm run db:push` pentru a crea tabelele
3. Verifică conexiunea la MySQL

## Verificare finală

După deploy, verifică:
1. ✅ Build-ul a reușit
2. ✅ Aplicația pornește fără erori
3. ✅ `DATABASE_URL` este setat corect
4. ✅ Tabelele există în baza de date
5. ✅ Poți accesa site-ul și funcționalitățile

---

## 📞 Suport

Dacă ai probleme cu deploy-ul:
1. Verifică logurile în panoul Hostinger
2. Contactează suportul Hostinger
3. Verifică documentația Hostinger pentru deploy

