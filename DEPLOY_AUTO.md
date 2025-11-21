# Deploy Automat - Fără SSH Manual

## Opțiunea 1: Hostinger Auto-Deploy (Recomandat)

Dacă Hostinger are auto-deploy din GitHub:

1. **Configurează în panoul Hostinger:**
   - Repository: `visionadvertising/sportisia`
   - Branch: `main`
   - Build command: `npm run build`
   - Output directory: `dist`
   - **Post-deploy script:** `cd server && npm install && chmod +x start.sh && ./start.sh`

2. **Backend-ul se va porni automat** după fiecare deploy.

## Opțiunea 2: GitHub Actions (Dacă ai SSH keys)

1. Adaugă în GitHub Secrets:
   - `HOSTINGER_HOST`
   - `HOSTINGER_USER`
   - `HOSTINGER_SSH_KEY`

2. GitHub Actions va rula automat la fiecare push în `server/`.

## Opțiunea 3: Manual prin Hostinger Panel

1. În panoul Hostinger, caută "Cron Jobs" sau "Scheduled Tasks"
2. Creează un cron job care rulează:
   ```bash
   cd ~/domains/papayawhip-narwhal-717195.hostingersite.com/public_html/server && ./start.sh
   ```

## Opțiunea 4: Contactează Suportul Hostinger

Cere-le să:
1. Instaleze PM2 global pe server
2. Configureze un serviciu systemd pentru backend
3. Sau să ruleze `server/start.sh` automat la fiecare deploy

## Verificare

După deploy, verifică:
- `https://papayawhip-narwhal-717195.hostingersite.com/api/health`
- Ar trebui să vezi: `{"success":true,"message":"API is running"}`

