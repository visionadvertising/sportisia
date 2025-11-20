# Instrucțiuni pentru a pune proiectul pe Git

## Pasul 1: Instalează Git
1. Descarcă Git de la: https://git-scm.com/download/win
2. Instalează Git (lasă setările default)
3. Redeschide terminalul după instalare

## Pasul 2: Configurează Git (prima dată)
```bash
git config --global user.name "Numele Tău"
git config --global user.email "email@example.com"
```

## Pasul 3: Inițializează repository-ul local
```bash
cd C:\Users\Admin\Desktop\sportisiaro
git init
git add .
git commit -m "Initial commit"
```

## Pasul 4: Creează un repository pe GitHub/GitLab
1. Mergi pe https://github.com (sau GitLab)
2. Creează un cont dacă nu ai
3. Click pe "New repository" sau "+" → "New repository"
4. Dă-i un nume (ex: "sportisiaro")
5. NU bifa "Initialize with README" (avem deja cod)
6. Click "Create repository"

## Pasul 5: Conectează repository-ul local cu cel remote
După ce ai creat repository-ul, GitHub/GitLab îți va arăta comenzile. De obicei sunt:

**Pentru GitHub:**
```bash
git remote add origin https://github.com/username/sportisiaro.git
git branch -M main
git push -u origin main
```

**Sau dacă folosești SSH:**
```bash
git remote add origin git@github.com:username/sportisiaro.git
git branch -M main
git push -u origin main
```

## Pasul 6: Verifică
Mergi pe repository-ul tău pe GitHub/GitLab și ar trebui să vezi toate fișierele.

## Comenzi utile pentru viitor:
```bash
# Vezi statusul modificărilor
git status

# Adaugă toate modificările
git add .

# Creează un commit
git commit -m "Descrierea modificărilor"

# Trimite modificările pe GitHub/GitLab
git push

# Descarcă modificările de pe server
git pull
```

