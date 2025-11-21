# Sportisiaro

Aplicație web pentru gestionarea terenurilor sportive.

## Setup

1. Instalează dependențele:
```bash
npm install
```

2. Configurează baza de date:
Creează un fișier `.env` în root:
```
DATABASE_URL=mysql://user:password@localhost:3306/database
```

3. Generează Prisma Client:
```bash
npm run db:generate
```

4. Creează tabelele în baza de date:
```bash
npm run db:push
```

5. Adaugă terenuri de test:
Accesează `/api/setup` în browser sau rulează:
```bash
curl http://localhost:3001/api/setup
```

6. Rulează aplicația:
```bash
npm run dev
```

## Deploy pe Hostinger

1. Setează `DATABASE_URL` în Environment Variables din panoul Hostinger
2. Build-ul se face automat la push pe GitHub
3. Accesează `/api/setup` pentru a inițializa baza de date
