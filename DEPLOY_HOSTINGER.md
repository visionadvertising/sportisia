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

### Opțiunea 2: Deploy manual (Rebuild)

**Pași pentru rebuild manual:**

1. **Intră în panoul Hostinger** (hpanel.hostinger.com)
2. **Navighează la:** 
   - **Management** → **Websites** → **[site-ul tău]** (lavender-cassowary-938357.hostingersite.com)
3. **Caută una dintre aceste secțiuni:**
   - **"Deploy"** sau
   - **"Builds"** sau
   - **"CI/CD"** sau
   - **"Git Integration"** sau
   - **"Deployment"**

4. **În acea secțiune, caută butonul:**
   - **"Deploy"** sau
   - **"Rebuild"** sau
   - **"Build Now"** sau
   - **"Redeploy"**

5. **Click pe buton pentru a declanșa rebuild-ul manual**

**Alternativ:**
- Dacă nu găsești butonul, poți face un **push gol pe GitHub**:
  ```bash
  git commit --allow-empty -m "Trigger rebuild"
  git push
  ```
  Aceasta va declanșa rebuild-ul automat dacă este configurat.

## Pași pentru deploy

### Pasul 1: Asigură-te că codul este pe GitHub

Verifică că toate modificările sunt push-uite:
```bash
git status
git push
```

### Pasul 2: Setează variabilele de mediu

**⚠️ IMPORTANT:** Pe Hostinger, variabilele de mediu trebuie setate corect pentru a fi disponibile la runtime.

**Unde să le setezi:**
1. **Intră în panoul Hostinger**
2. **Navighează la:** Management > Websites > [site-ul tău] > **Environment Variables**
3. **Adaugă variabila:**
   - **Nume:** `DATABASE_URL`
   - **Valoare:** `mysql://u328389087_sportisiaro_user:K6PI#+/h@localhost:3306/u328389087_sportisiaro`
   (Înlocuiește cu datele tale reale din baza de date MySQL)
4. **⚠️ CRITIC: Click pe butonul "Save" (purple) din colțul dreapta jos**
5. **După salvare, declanșează un rebuild manual**

**Dacă variabila nu este disponibilă la runtime:**
- Verifică că ai salvat setările (click pe "Save")
- Verifică că ai declanșat un rebuild după salvare
- Verifică logurile aplicației pentru a vedea ce variabile sunt disponibile
- Contactează suportul Hostinger dacă problema persistă

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

