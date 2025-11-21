# Configurare Hostinger pentru Next.js Static Export

## Configurație Build pe Hostinger

1. **Framework:** Next.js (NU Vite!)
2. **Build Command:** `npm run build`
3. **Output Directory:** `out` (NU `.next`!)
4. **Node Version:** 22.x (sau cea mai recentă)

## Pași în Panoul Hostinger

1. Intră în **Management > Websites > [site-ul tău]**
2. Caută **"Build configuration"** sau **"Deployment settings"**
3. Setează:
   - **Framework:** Next.js
   - **Build command:** `npm run build`
   - **Output directory:** `out`
   - **Node version:** 22.x
4. Click **Save**
5. Declanșează rebuild-ul

## Verificare

După build, verifică că în directorul `out/` există:
- `index.html`
- `_next/static/` (cu chunks-urile)
- Alte fișiere statice

## Dacă tot nu funcționează

Dacă Hostinger nu suportă Next.js static export, contactează suportul și cere-le să:
1. Servească fișierele din directorul `out/` după build
2. Sau să configureze Next.js corect pentru static export

