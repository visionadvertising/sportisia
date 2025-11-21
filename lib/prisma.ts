import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

// Funcție pentru a încărca .env
function loadEnvFile(): boolean {
  if (typeof window !== 'undefined') {
    return false; // Nu pe client
  }

  // Dacă DATABASE_URL este deja setat corect și nu este build default, nu mai încărca
  if (process.env.DATABASE_URL && 
      !process.env.DATABASE_URL.startsWith('file:') && 
      !process.env.DATABASE_URL.includes('build_user') &&
      !process.env.DATABASE_URL.includes('build_db') &&
      process.env.DATABASE_URL.includes('u328389087_sportisiaro')) {
    console.log('✅ DATABASE_URL already set correctly:', process.env.DATABASE_URL.substring(0, 50) + '...');
    return true;
  }

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

  console.log('🔍 Searching for .env file in:', possiblePaths.map(p => p.substring(0, 60) + '...'));

  for (const envPath of possiblePaths) {
    if (existsSync(envPath)) {
      try {
        console.log('🔍 Found .env file at:', envPath);
        const beforeLoad = process.env.DATABASE_URL;
        config({ path: envPath, override: true }); // override pentru a înlocui build default
        const afterLoad = process.env.DATABASE_URL;
        
        console.log('🔍 Before load:', beforeLoad ? beforeLoad.substring(0, 40) + '...' : 'NOT SET');
        console.log('🔍 After load:', afterLoad ? afterLoad.substring(0, 40) + '...' : 'NOT SET');
        
        if (process.env.DATABASE_URL && 
            !process.env.DATABASE_URL.startsWith('file:') && 
            !process.env.DATABASE_URL.includes('build_user') &&
            !process.env.DATABASE_URL.includes('build_db')) {
          console.log('✅ Loaded .env file from:', envPath);
          console.log('✅ DATABASE_URL loaded:', process.env.DATABASE_URL.substring(0, 50) + '...');
          return true;
        } else {
          console.log('⚠️ .env file found but DATABASE_URL is still invalid:', 
            process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 50) : 'NOT SET');
        }
      } catch (error: any) {
        console.log('⚠️ Error loading .env from:', envPath, error.message);
      }
    }
  }

  if (process.env.NODE_ENV === 'production') {
    console.log('⚠️ .env file not found. DATABASE_URL will need to be set via environment variables.');
    console.log('⚠️ Current DATABASE_URL:', process.env.DATABASE_URL ? 
      process.env.DATABASE_URL.substring(0, 50) + '...' : 'NOT SET');
  }

  return false;
}

// Setează DATABASE_URL default pentru build time (dacă nu este setat)
// Aceasta permite build-ul să treacă chiar dacă .env nu este disponibil
// IMPORTANT: Trebuie setat ÎNAINTE de a importa Prisma
// Folosim o valoare MySQL validă pentru a trece validarea Prisma
if (typeof window === 'undefined' && !process.env.DATABASE_URL) {
  // Folosim o valoare MySQL validă (nu doar "placeholder")
  // Aceasta va trece validarea Prisma la build time
  process.env.DATABASE_URL = 'mysql://build_user:build_pass@localhost:3306/build_db';
  console.log('⚠️ Using default DATABASE_URL for build time');
}

// Încarcă .env IMEDIAT la import (înainte de Prisma)
// IMPORTANT: Această funcție trebuie să ruleze înainte de a importa Prisma
// Dar după ce am setat placeholder-ul pentru build time
// În producție, încercăm să încărcăm .env de fiecare dată
if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
  // În producție, forțăm încărcarea .env la fiecare import
  const envLoaded = loadEnvFile();
  if (envLoaded && process.env.DATABASE_URL && 
      !process.env.DATABASE_URL.includes('build_user') &&
      !process.env.DATABASE_URL.includes('build_db')) {
    console.log('✅ .env loaded successfully at import time');
  } else {
    console.warn('⚠️ .env not loaded at import time, will retry at runtime');
  }
} else {
  const envLoaded = loadEnvFile();
  if (envLoaded && process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('placeholder')) {
    console.log('✅ .env loaded successfully at import time');
  }
}

// Import Prisma DUPĂ ce am setat default
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

// Creează PrismaClient doar când este necesar (lazy initialization)
// Astfel evităm validarea DATABASE_URL la import time
let prismaInstance: PrismaClient | null = null;

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  if (prismaInstance) {
    return prismaInstance;
  }

  // Asigură-te că .env este încărcat înainte de a crea PrismaClient
  // Verifică dacă DATABASE_URL este build default sau invalid
  // FORȚĂM încărcarea .env la fiecare apel în producție
  if (!process.env.DATABASE_URL || 
      process.env.DATABASE_URL.startsWith('file:') || 
      process.env.DATABASE_URL.includes('build_user') ||
      process.env.DATABASE_URL.includes('build_db')) {
    
    console.log('🔍 DATABASE_URL not set or is build default, loading .env...');
    console.log('🔍 Current DATABASE_URL before load:', process.env.DATABASE_URL ? 
      process.env.DATABASE_URL.substring(0, 50) + '...' : 'NOT SET');
    console.log('🔍 Current working directory:', process.cwd());
    
    // Încarcă .env cu override pentru a înlocui build default
    const loaded = loadEnvFile();
    
    console.log('🔍 After loadEnvFile, loaded:', loaded);
    console.log('🔍 After loadEnvFile, DATABASE_URL:', process.env.DATABASE_URL ? 
      process.env.DATABASE_URL.substring(0, 50) + '...' : 'NOT SET');
    
    // Dacă încă este build default, încercăm să citim direct din fișier
    if (!loaded || !process.env.DATABASE_URL || 
        process.env.DATABASE_URL.includes('build_user') ||
        process.env.DATABASE_URL.includes('build_db') ||
        process.env.DATABASE_URL.startsWith('file:')) {
      
      // Încercăm să citim direct din fișier - verificăm toate path-urile posibile
      const cwd = process.cwd();
      const possibleEnvPaths = [
        resolve(cwd, '.env'),
        resolve(cwd, '.env.local'),
        resolve(cwd, '.env.production'),
        resolve('/home/u328389087/domains/lavender-cassowary-938357.hostingersite.com/public_html', '.env'),
        resolve('/home/u328389087/domains/lavender-cassowary-938357.hostingersite.com/public_html', '.env.local'),
        resolve('/home/u328389087/domains/lavender-cassowary-938357.hostingersite.com/public_html', '.env.production'),
      ];
      
      console.log('🔍 Trying to read .env file directly from multiple paths...');
      let foundEnv = false;
      
      for (const envPath of possibleEnvPaths) {
        console.log('🔍 Checking:', envPath);
        if (existsSync(envPath)) {
          try {
            console.log('✅ Found .env file at:', envPath);
            const envContent = readFileSync(envPath, 'utf8');
            console.log('🔍 .env file size:', envContent.length, 'chars');
            console.log('🔍 .env file content (first 200 chars):', envContent.substring(0, 200));
            
            // Parsează manual DATABASE_URL - caută pe mai multe linii
            const lines = envContent.split('\n');
            for (const line of lines) {
              const trimmedLine = line.trim();
              if (trimmedLine.startsWith('DATABASE_URL=')) {
                const dbUrl = trimmedLine.substring('DATABASE_URL='.length).trim();
                // Elimină ghilimele dacă există
                const cleanDbUrl = dbUrl.replace(/^["']|["']$/g, '');
                if (cleanDbUrl && !cleanDbUrl.includes('build_user') && !cleanDbUrl.includes('build_db')) {
                  process.env.DATABASE_URL = cleanDbUrl;
                  console.log('✅ Loaded DATABASE_URL directly from .env file:', cleanDbUrl.substring(0, 50) + '...');
                  foundEnv = true;
                  break;
                } else {
                  console.log('⚠️ DATABASE_URL in .env is still build default:', cleanDbUrl.substring(0, 50));
                }
              }
            }
            
            if (foundEnv) {
              break;
            }
          } catch (error: any) {
            console.error('❌ Error reading .env file from', envPath, ':', error.message);
          }
        } else {
          console.log('❌ .env file does not exist at:', envPath);
        }
      }
      
      if (!foundEnv) {
        console.error('❌ Could not find or read .env file from any of the checked paths');
      }
      
      // Verifică din nou după citirea directă
      if (!process.env.DATABASE_URL || 
          process.env.DATABASE_URL.includes('build_user') ||
          process.env.DATABASE_URL.includes('build_db') ||
          process.env.DATABASE_URL.startsWith('file:')) {
        console.error('❌ DATABASE_URL is still not set after loading .env');
        console.error('❌ Current DATABASE_URL:', process.env.DATABASE_URL || 'NOT SET');
        console.error('❌ Current working directory:', process.cwd());
        console.error('❌ Please create .env file with: DATABASE_URL=mysql://user:password@localhost:3306/database');
        
        throw new Error(
          'DATABASE_URL environment variable is not set. ' +
          'Please create a .env file in /home/u328389087/domains/lavender-cassowary-938357.hostingersite.com/public_html/ ' +
          'with: DATABASE_URL=mysql://u328389087_sportisiaro_user:[password]@localhost:3306/u328389087_sportisiaro. ' +
          'Current value: ' + (process.env.DATABASE_URL || 'NOT SET')
        );
      }
    }
  }

  // Verifică din nou după încărcarea .env
  if (!process.env.DATABASE_URL || 
      process.env.DATABASE_URL.includes('build_user') ||
      process.env.DATABASE_URL.includes('build_db') ||
      process.env.DATABASE_URL.startsWith('file:')) {
    console.error('❌ DATABASE_URL is still not set correctly after loading .env');
    console.error('❌ Current DATABASE_URL:', process.env.DATABASE_URL || 'NOT SET');
    throw new Error(
      'DATABASE_URL environment variable is not set correctly. ' +
      'Please create a .env file in the application root with: ' +
      'DATABASE_URL=mysql://user:password@localhost:3306/database'
    );
  }

  // Acum creează PrismaClient
  try {
    console.log('🔧 Creating PrismaClient with DATABASE_URL:', process.env.DATABASE_URL.substring(0, 30) + '...');
    prismaInstance = new PrismaClient();
    
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prismaInstance;
    }
    
    return prismaInstance;
  } catch (error: any) {
    console.error('❌ Failed to create PrismaClient:', error.message);
    throw error;
  }
}

// Export lazy - se creează doar când este accesat
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    const client = getPrismaClient();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});

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

