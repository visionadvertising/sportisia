# 🔧 Fix pentru Environment Variables pe Hostinger

## Problema

Pe Hostinger, variabilele de mediu setate în **"Deployment settings"** sau **"Environment Variables"** sunt disponibile doar la **build time**, nu la **runtime**.

## Soluții

### Soluția 1: Runtime Environment Variables (Recomandat)

1. **Intră în panoul Hostinger**
2. **Caută o secțiune separată pentru runtime:**
   - **Management > Websites > [site-ul tău] > Application Settings**
   - **Management > Websites > [site-ul tău] > Runtime Environment Variables**
   - **Management > Websites > [site-ul tău] > Node.js Settings**
   - **Management > Websites > [site-ul tău] > Process Manager Settings**

3. **Adaugă variabila `DATABASE_URL` acolo:**
   - Nume: `DATABASE_URL`
   - Valoare: `mysql://u328389087_sportisiaro_user:[parola]@localhost:3306/u328389087_sportisiaro`

4. **Salvează și repornește aplicația**

### Soluția 2: Fișier .env pe server

Dacă ai acces SSH:

1. **Conectează-te via SSH**
2. **Navighează la directorul aplicației:**
   ```bash
   cd ~/domains/lavender-cassowary-938357.hostingersite.com/public_html
   ```

3. **Creează fișierul `.env`:**
   ```bash
   nano .env
   ```

4. **Adaugă:**
   ```
   DATABASE_URL=mysql://u328389087_sportisiaro_user:[parola]@localhost:3306/u328389087_sportisiaro
   ```

5. **Salvează și repornește aplicația**

### Soluția 3: Contactează suportul Hostinger

Dacă nu găsești o secțiune pentru runtime environment variables:

1. **Contactează suportul Hostinger**
2. **Spune-le:** "Am nevoie să setez variabile de mediu pentru runtime pentru aplicația mea Next.js"
3. **Cere-le să:**
   - Adauge `DATABASE_URL` la environment variables pentru runtime
   - Sau să îți spună unde să le setez

## Verificare

După ce ai setat variabilele:

1. **Repornește aplicația** (dacă este necesar)
2. **Accesează:** `https://lavender-cassowary-938357.hostingersite.com/api/setup`
3. **Verifică răspunsul** - ar trebui să vezi `debug.DATABASE_URL_FULL` setat

## Notă importantă

- Variabilele din **"Deployment settings"** sunt doar pentru build time
- Pentru runtime, trebuie să fie setate într-un loc separat
- Pe unele hosting-uri, variabilele trebuie setate în **Process Manager** (PM2, etc.)

