import { PrismaClient } from '@prisma/client';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Asigură-te că folderul data există
const dataDir = join(process.cwd(), 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// Setează DATABASE_URL dacă nu este setat
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./data/database.db';
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Inițializează baza de date la prima conexiune
let dbInitialized = false;

async function initializeDatabase() {
  if (dbInitialized) return;
  
  try {
    // Verifică dacă baza de date există și are tabele
    await prisma.$queryRaw`SELECT 1 FROM SportsField LIMIT 1`;
    dbInitialized = true;
  } catch (error: any) {
    // Dacă tabelele nu există, le creează folosind SQL direct
    if (error.message?.includes('no such table') || error.message?.includes('does not exist')) {
      console.log('🔄 Initializing database tables...');
      try {
        // Creează tabelele manual
        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "SportsField" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "name" TEXT NOT NULL,
            "type" TEXT NOT NULL,
            "location" TEXT NOT NULL,
            "city" TEXT NOT NULL,
            "description" TEXT NOT NULL DEFAULT '',
            "contactName" TEXT NOT NULL,
            "contactPhone" TEXT NOT NULL,
            "contactEmail" TEXT NOT NULL,
            "amenities" TEXT NOT NULL DEFAULT '[]',
            "pricePerHour" REAL,
            "imageUrl" TEXT,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
        `);
        
        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "Coach" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "name" TEXT NOT NULL,
            "sport" TEXT NOT NULL,
            "city" TEXT NOT NULL,
            "location" TEXT,
            "description" TEXT NOT NULL DEFAULT '',
            "experience" TEXT NOT NULL DEFAULT '',
            "qualifications" TEXT NOT NULL DEFAULT '[]',
            "contactName" TEXT NOT NULL,
            "contactPhone" TEXT NOT NULL,
            "contactEmail" TEXT NOT NULL,
            "pricePerHour" REAL,
            "imageUrl" TEXT,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
        `);
        
        // Creează indexurile
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SportsField_type_idx" ON "SportsField"("type");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SportsField_city_idx" ON "SportsField"("city");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Coach_sport_idx" ON "Coach"("sport");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Coach_city_idx" ON "Coach"("city");`);
        
        console.log('✅ Database initialized successfully');
      } catch (initError) {
        console.error('❌ Error initializing database:', initError);
      }
    }
    dbInitialized = true;
  }
}

// Inițializează la prima conexiune
prisma.$connect()
  .then(() => initializeDatabase())
  .catch(console.error);

