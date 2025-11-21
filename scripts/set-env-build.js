// Script pentru a seta DATABASE_URL înainte de prisma generate
// Folosit pentru build time când .env nu este disponibil
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'mysql://build_user:build_pass@localhost:3306/build_db';
  console.log('⚠️ Using build-time DATABASE_URL for prisma generate');
}

