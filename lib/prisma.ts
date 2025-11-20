import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Încarcă .env manual în producție (Next.js nu o face automat)
if (process.env.NODE_ENV === 'production') {
  const envPath = resolve(process.cwd(), '.env');
  if (existsSync(envPath)) {
    try {
      config({ path: envPath });
      console.log('✅ Loaded .env file from:', envPath);
      console.log('✅ DATABASE_URL after loading .env:', process.env.DATABASE_URL ? 'SET (' + process.env.DATABASE_URL.length + ' chars)' : 'NOT SET');
    } catch (error: any) {
      console.log('⚠️ Error loading .env file:', error.message);
    }
  } else {
    console.log('⚠️ .env file not found at:', envPath);
    console.log('⚠️ Current working directory:', process.cwd());
    // Încearcă și din public_html
    const altPath = resolve(process.cwd(), 'public_html', '.env');
    if (existsSync(altPath)) {
      try {
        config({ path: altPath });
        console.log('✅ Loaded .env file from:', altPath);
      } catch (error: any) {
        console.log('⚠️ Error loading .env from public_html:', error.message);
      }
    }
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Verifică că DATABASE_URL este setat (doar la runtime, nu la build time)
function validateDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Please set it to your MySQL connection string. ' +
      'Example: mysql://user:password@host:3306/database'
    );
  }

  // Verifică doar că nu este SQLite (valoare veche)
  // Lăsăm Prisma să valideze restul connection string-ului
  if (process.env.DATABASE_URL.startsWith('file:')) {
    throw new Error(
      'DATABASE_URL is set to SQLite (file:), but the application now uses MySQL. ' +
      'Please update DATABASE_URL to a MySQL connection string. ' +
      'Example: mysql://user:password@host:3306/database ' +
      'Note: If your password contains special characters (#, +, /, etc.), they must be URL-encoded. ' +
      'For example: # becomes %23, + becomes %2B, / becomes %2F'
    );
  }
}

// Validează doar la runtime, nu la build time
// Nu validăm la build time pentru a permite build-ul să treacă chiar dacă DATABASE_URL nu este setat
// Validarea se va face la runtime când se încearcă să se folosească baza de date

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Inițializează baza de date la prima conexiune
let dbInitialized = false;
let dbInitializing = false;

export async function ensureDatabaseInitialized() {
  // Debug: log toate variabilele de mediu disponibile
  const allEnvKeys = Object.keys(process.env);
  const databaseKeys = allEnvKeys.filter(k => 
    k.includes('DATABASE') || k.includes('DB') || k.includes('MYSQL')
  );
  
  console.log('🔍 Environment variables check:', {
    DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
    DATABASE_URL_LENGTH: process.env.DATABASE_URL?.length || 0,
    DATABASE_URL_PREVIEW: process.env.DATABASE_URL?.substring(0, 30) || 'NOT SET',
    ALL_DATABASE_KEYS: databaseKeys,
    NODE_ENV: process.env.NODE_ENV,
    TOTAL_ENV_KEYS: allEnvKeys.length
  });

  // Validează doar că DATABASE_URL este setat și nu este SQLite
  // Lăsăm Prisma să valideze connection string-ul complet
  if (!process.env.DATABASE_URL) {
    const errorMsg = 'DATABASE_URL environment variable is not set. ' +
      'Please set it to your MySQL connection string. ' +
      'Example: mysql://user:password@host:3306/database. ' +
      `Found ${databaseKeys.length} database-related env keys: ${databaseKeys.join(', ')}`;
    console.error('❌', errorMsg);
    throw new Error(errorMsg);
  }

  if (process.env.DATABASE_URL.startsWith('file:')) {
    throw new Error(
      'DATABASE_URL is set to SQLite (file:), but the application now uses MySQL. ' +
      'Please update DATABASE_URL to a MySQL connection string. ' +
      'Note: If your password contains special characters (#, +, /, etc.), they must be URL-encoded.'
    );
  }
  
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
      setTimeout(() => reject(new Error('Connection timeout')), 5000)
    );
    await Promise.race([connectPromise, connectTimeout]);
    
    // Verifică dacă tabelele există (folosește backticks pentru MySQL)
    const queryPromise = prisma.$queryRaw`SELECT 1 FROM \`SportsField\` LIMIT 1`;
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Query timeout')), 5000)
    );
    
    await Promise.race([queryPromise, timeoutPromise]);
    dbInitialized = true;
    dbInitializing = false;
  } catch (error: any) {
    // Dacă tabelele nu există, folosește Prisma migrate sau db push
    // MySQL error code 42S02 = Table doesn't exist, ER_NO_SUCH_TABLE = Table doesn't exist
    if (error.message?.includes('does not exist') || 
        error.message?.includes('Table') || 
        error.code === '42S02' ||
        error.code === 'ER_NO_SUCH_TABLE') {
      console.log('🔄 Database tables do not exist. Please run: npm run db:push');
      dbInitializing = false;
      throw new Error(
        'Database tables not found. Please run "npm run db:push" to create the schema. ' +
        'If you are in production, ensure migrations have been applied.'
      );
    } else {
      // Alt tip de eroare - resetează flag-ul și lasă aplicația să continue
      console.error('Database connection error:', error.message);
      dbInitializing = false;
      throw error;
    }
  }
}

// Nu mai inițializăm automat la pornire - se va face la primul acces
// Inițializarea se face doar când este necesară, cu timeout

