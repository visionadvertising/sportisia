# 🚀 Cum pornești proiectul - Ghid Rapid

## Pași pentru a porni aplicația:

### 1️⃣ Deschide Terminal/PowerShell
Deschide terminalul în folderul proiectului: `C:\Users\Admin\Desktop\sportisiaro`

### 2️⃣ Instalează dependențele
```bash
npm install
```
⏱️ Așteaptă câteva minute până se instalează toate pachetele.

### 3️⃣ Generează clientul Prisma
```bash
npm run db:generate
```

### 4️⃣ Creează baza de date
```bash
npm run db:push
```

### 5️⃣ Pornește aplicația
```bash
npm run dev
```

### 6️⃣ Deschide în browser
Deschide browserul și accesează: **http://localhost:3000**

---

## ✅ Verificare

După ce pornești aplicația, ar trebui să vezi:
- Pagina principală cu header-ul "Sportisiaro"
- Butoane pentru filtrare (Toate, Tenis, Fotbal, etc.)
- Buton "Adaugă Teren"

## 🎯 Prima dată când folosești aplicația:

1. Click pe **"+ Adaugă Teren"**
2. Completează formularul cu datele unui teren
3. Salvează și vezi terenul în listă!

---

## ⚠️ Dacă apare o eroare:

**Eroare: "Prisma Client has not been generated"**
```bash
npm run db:generate
```

**Eroare: "Cannot find module"**
```bash
npm install
```

**Eroare: "Database does not exist"**
```bash
npm run db:push
```

---

## 📝 Comenzi utile:

- `npm run dev` - Pornește aplicația (folosește asta pentru dezvoltare)
- `npm run build` - Construiește pentru producție
- `npm run db:studio` - Deschide Prisma Studio (vezi datele din baza de date)

---

**Gata! Aplicația ar trebui să funcționeze acum! 🎉**


