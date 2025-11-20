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
// Folosește calea absolută pentru a funcționa corect în producție
if (!process.env.DATABASE_URL) {
  const dbPath = join(process.cwd(), 'data', 'database.db');
  // Normalizează calea pentru Windows (înlocuiește backslash cu forward slash)
  const normalizedPath = dbPath.replace(/\\/g, '/');
  process.env.DATABASE_URL = `file:${normalizedPath}`;
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Inițializează baza de date la prima conexiune
let dbInitialized = false;
let dbInitializing = false;

export async function ensureDatabaseInitialized() {
  if (dbInitialized) return;
  if (dbInitializing) {
    // Așteaptă dacă inițializarea este deja în curs, dar cu timeout
    let waitCount = 0;
    const maxWait = 30; // Maximum 3 seconds wait
    while (dbInitializing && waitCount < maxWait) {
      await new Promise(resolve => setTimeout(resolve, 100));
      waitCount++;
    }
    if (dbInitializing) {
      // Timeout - resetează flag-ul
      dbInitializing = false;
      throw new Error('Database initialization timeout');
    }
    return;
  }
  
  dbInitializing = true;
  
  try {
    // Conectează cu timeout
    const connectPromise = prisma.$connect();
    const connectTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 3000)
    );
    await Promise.race([connectPromise, connectTimeout]);
    
    // Adaugă timeout pentru query
    const queryPromise = prisma.$queryRaw`SELECT 1 FROM SportsField LIMIT 1`;
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Query timeout')), 3000)
    );
    
    await Promise.race([queryPromise, timeoutPromise]);
    dbInitialized = true;
    dbInitializing = false;
  } catch (error: any) {
    // Dacă tabelele nu există, le creează folosind SQL direct
    if (error.message?.includes('no such table') || error.message?.includes('does not exist')) {
      console.log('🔄 Initializing database tables...');
      try {
        // Funcție helper pentru SQL cu timeout
        const executeWithTimeout = async (sql: string, timeout = 10000) => {
          return Promise.race([
            prisma.$executeRawUnsafe(sql),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('SQL execution timeout')), timeout)
            )
          ]);
        };

        // Creează tabelele manual cu timeout
        await executeWithTimeout(`
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
        
        await executeWithTimeout(`
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
        
        // Creează indexurile cu timeout mai scurt
        await executeWithTimeout(`CREATE INDEX IF NOT EXISTS "SportsField_type_idx" ON "SportsField"("type");`, 5000);
        await executeWithTimeout(`CREATE INDEX IF NOT EXISTS "SportsField_city_idx" ON "SportsField"("city");`, 5000);
        await executeWithTimeout(`CREATE INDEX IF NOT EXISTS "Coach_sport_idx" ON "Coach"("sport");`, 5000);
        await executeWithTimeout(`CREATE INDEX IF NOT EXISTS "Coach_city_idx" ON "Coach"("city");`, 5000);
        
        console.log('✅ Database initialized successfully');
        dbInitialized = true;
      } catch (initError: any) {
        console.error('❌ Error initializing database:', initError);
        dbInitializing = false;
        // Nu arunca eroare, lasă aplicația să continue
        // Baza de date va fi inițializată la următorul request
        return;
      }
    } else {
      // Alt tip de eroare - resetează flag-ul și lasă aplicația să continue
      console.error('Database query error:', error);
      dbInitializing = false;
      return;
    }
    dbInitializing = false;
  }
}

// Nu mai inițializăm automat la pornire - se va face la primul acces
// Inițializarea se face doar când este necesară, cu timeout

