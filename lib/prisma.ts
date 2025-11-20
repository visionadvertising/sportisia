import { PrismaClient } from '@prisma/client';

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

  // Verifică că DATABASE_URL nu este setat la SQLite (valoare veche)
  if (process.env.DATABASE_URL.startsWith('file:')) {
    throw new Error(
      'DATABASE_URL is set to SQLite (file:), but the application now uses MySQL. ' +
      'Please update DATABASE_URL to a MySQL connection string. ' +
      'Example: mysql://user:password@host:3306/database ' +
      'Current value: ' + process.env.DATABASE_URL.substring(0, 50) + '...'
    );
  }

  // Verifică că DATABASE_URL este un connection string MySQL valid
  if (!process.env.DATABASE_URL.startsWith('mysql://')) {
    throw new Error(
      'DATABASE_URL must start with "mysql://" for MySQL. ' +
      'Current value starts with: ' + process.env.DATABASE_URL.substring(0, 20) + '... ' +
      'Please set it to: mysql://user:password@host:3306/database'
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
  // Validează DATABASE_URL la runtime (când se încearcă să se folosească baza de date)
  try {
    validateDatabaseUrl();
  } catch (validationError: any) {
    // Dacă validarea eșuează, aruncă eroarea cu mesaj clar
    console.error('❌ DATABASE_URL validation failed:', validationError.message);
    console.error('Current DATABASE_URL:', process.env.DATABASE_URL ? 
      process.env.DATABASE_URL.substring(0, 50) + '...' : 'NOT SET');
    throw validationError;
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

