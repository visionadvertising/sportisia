import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Încarcă .env manual în producție (Next.js nu o face automat)
// NU rulează la build time pentru a permite build-ul să treacă
if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
  // Verifică dacă suntem la runtime (nu la build time)
  // La build time, process.env.NODE_ENV este 'production' dar nu trebuie să încărcăm .env
  // Vom încărca .env doar când este necesar (la primul acces la baza de date)
  // Această logică este mutată în ensureDatabaseInitialized()
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
  // Încearcă să încarce .env dacă DATABASE_URL nu este setat sau este SQLite
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:')) {
    try {
      const cwd = process.cwd();
      const possiblePaths = [
        resolve(cwd, '.env'),
        resolve(cwd, '.env.local'),
        resolve(cwd, '.env.production'),
        resolve(cwd, 'public_html', '.env'),
        resolve(cwd, '..', '.env'),
        resolve(cwd, '..', 'public_html', '.env'),
        resolve('/home/u328389087/domains/lavender-cassowary-938357.hostingersite.com/public_html', '.env'),
        resolve('/home/u328389087/domains/lavender-cassowary-938357.hostingersite.com/public_html', '.env.local'),
        resolve('/home/u328389087/domains/lavender-cassowary-938357.hostingersite.com/public_html', '.env.production'),
      ];

      console.log('🔍 Searching for .env file...');
      console.log('🔍 Current working directory:', cwd);
      
      let loaded = false;
      for (const envPath of possiblePaths) {
        const exists = existsSync(envPath);
        console.log(`  ${exists ? '✅' : '❌'} ${envPath}`);
        
        if (exists) {
          try {
            config({ path: envPath });
            console.log('✅ Loaded .env file from:', envPath);
            console.log('✅ DATABASE_URL after loading .env:', process.env.DATABASE_URL ? 'SET (' + process.env.DATABASE_URL.length + ' chars)' : 'NOT SET');
            if (process.env.DATABASE_URL) {
              console.log('✅ DATABASE_URL preview:', process.env.DATABASE_URL.substring(0, 30) + '...');
            }
            loaded = true;
            break;
          } catch (error: any) {
            console.log('⚠️ Error loading .env from:', envPath, error.message);
          }
        }
      }

      if (!loaded) {
        console.log('⚠️ .env file not found in any of these locations:');
        possiblePaths.forEach(path => console.log('  -', path));
        console.log('⚠️ Current working directory:', cwd);
        console.log('⚠️ Please create .env file in one of these locations with: DATABASE_URL=mysql://user:password@localhost:3306/database');
      }
    } catch (envError: any) {
      console.log('⚠️ Could not load .env:', envError.message);
      console.log('⚠️ Error stack:', envError.stack);
    }
  }

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

