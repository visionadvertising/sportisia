// Script pentru a testa conexiunea MySQL direct
import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

// Încarcă .env
const cwd = process.cwd();
const possiblePaths = [
  resolve(cwd, '.env'),
  resolve(cwd, '.env.local'),
  resolve(cwd, '.env.production'),
  resolve('/home/u328389087/domains/lavender-cassowary-938357.hostingersite.com/public_html', '.env'),
];

let envLoaded = false;
for (const envPath of possiblePaths) {
  if (existsSync(envPath)) {
    config({ path: envPath, override: true });
    envLoaded = true;
    console.log('✅ Loaded .env from:', envPath);
    break;
  }
}

if (!envLoaded) {
  console.error('❌ .env file not found');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL.substring(0, 50) + '...');

// Testează conexiunea
import mysql from 'mysql2/promise';

async function testConnection() {
  try {
    const url = new URL(process.env.DATABASE_URL!);
    
    console.log('🔍 Connection details:');
    console.log('  Host:', url.hostname);
    console.log('  Port:', url.port || '3306');
    console.log('  User:', url.username);
    console.log('  Password:', url.password ? url.password.substring(0, 3) + '***' : 'NOT SET');
    console.log('  Database:', url.pathname.substring(1));
    
    const connection = await mysql.createConnection({
      host: url.hostname,
      port: parseInt(url.port || '3306'),
      user: url.username,
      password: url.password,
      database: url.pathname.substring(1),
      connectTimeout: 5000
    });

    console.log('✅ Connected successfully!');
    
    const [rows] = await connection.query('SELECT 1 as test');
    console.log('✅ Query test successful:', rows);
    
    await connection.end();
    console.log('✅ Connection closed');
  } catch (error: any) {
    console.error('❌ Connection failed:');
    console.error('  Error:', error.message);
    console.error('  Code:', error.code);
    console.error('  Errno:', error.errno);
    console.error('  SQL State:', error.sqlState);
    process.exit(1);
  }
}

testConnection();

