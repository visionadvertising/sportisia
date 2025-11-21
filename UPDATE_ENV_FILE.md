# Actualizare fișier .env pe server

## Parola MySQL este: `Csl19920903`

## Comenzi SSH pentru actualizare:

```bash
cd /home/u328389087/domains/lavender-cassowary-938357.hostingersite.com/public_html

# Creează sau actualizează fișierul .env
cat > .env << 'EOF'
DATABASE_URL=mysql://u328389087_sportisiaro_us:Csl19920903@localhost:3306/u328389087_sportisiaro
EOF

# Setează permisiunile
chmod 644 .env

# Verifică conținutul
cat .env
```

## Verificare:

După ce ai creat fișierul, verifică că conține exact:
```
DATABASE_URL=mysql://u328389087_sportisiaro_us:Csl19920903@localhost:3306/u328389087_sportisiaro
```

**IMPORTANT:**
- Fără spații în jurul `=`
- Fără ghilimele
- Parola este: `Csl19920903`

## După actualizare:

1. Nu este nevoie de rebuild - aplicația va citi automat `.env` la fiecare request
2. Accesează: `https://lavender-cassowary-938357.hostingersite.com/api/setup`
3. Ar trebui să funcționeze acum!

