# QUICK FIX: Actualizează .env pe server

## Conectează-te via SSH și rulează:

```bash
cd /home/u328389087/domains/lavender-cassowary-938357.hostingersite.com/public_html
echo 'DATABASE_URL=mysql://u328389087_sportisiaro_us:Csl19920903@localhost:3306/u328389087_sportisiaro' > .env
chmod 644 .env
cat .env
```

## Verifică că vezi:

```
DATABASE_URL=mysql://u328389087_sportisiaro_us:Csl19920903@localhost:3306/u328389087_sportisiaro
```

## După ce ai creat fișierul:

1. Accesează: `https://lavender-cassowary-938357.hostingersite.com/api/setup`
2. Ar trebui să funcționeze acum!

**Nu este nevoie de rebuild** - aplicația va citi automat `.env` la fiecare request.

