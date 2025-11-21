import { NextResponse } from 'next/server';
import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

export async function GET() {
  try {
    // Încarcă .env manual
    const cwd = process.cwd();
    const possiblePaths = [
      resolve(cwd, '.env'),
      resolve(cwd, '.env.local'),
      resolve(cwd, '.env.production'),
      resolve('/home/u328389087/domains/lavender-cassowary-938357.hostingersite.com/public_html', '.env'),
    ];

    let envLoaded = false;
    let envPath = '';
    let envContent = '';

    for (const envPathCheck of possiblePaths) {
      if (existsSync(envPathCheck)) {
        try {
          config({ path: envPathCheck, override: true });
          envContent = readFileSync(envPathCheck, 'utf8');
          envPath = envPathCheck;
          envLoaded = true;
          break;
        } catch (error: any) {
          console.log('Error loading .env from', envPathCheck, ':', error.message);
        }
      }
    }

    // Parsează DATABASE_URL din conținut
    let dbUrlFromFile = '';
    if (envContent) {
      const lines = envContent.split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('DATABASE_URL=')) {
          dbUrlFromFile = trimmedLine.substring('DATABASE_URL='.length).trim();
          dbUrlFromFile = dbUrlFromFile.replace(/^["']|["']$/g, '');
          break;
        }
      }
    }

    // Extrage componentele din DATABASE_URL
    let dbUrlParsed: any = null;
    if (process.env.DATABASE_URL) {
      try {
        const url = new URL(process.env.DATABASE_URL);
        dbUrlParsed = {
          protocol: url.protocol,
          username: url.username,
          password: url.password ? url.password.substring(0, 3) + '***' : 'NOT SET',
          host: url.hostname,
          port: url.port || '3306',
          database: url.pathname.substring(1), // Remove leading /
          full: process.env.DATABASE_URL.substring(0, 50) + '...'
        };
      } catch (error: any) {
        dbUrlParsed = { error: error.message };
      }
    }

    // Încearcă să testeze conexiunea
    let connectionTest: any = { attempted: false };
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('build_user')) {
      try {
        const mysql = require('mysql2/promise');
        const url = new URL(process.env.DATABASE_URL);
        
        const connection = await mysql.createConnection({
          host: url.hostname,
          port: parseInt(url.port || '3306'),
          user: url.username,
          password: url.password,
          database: url.pathname.substring(1),
          connectTimeout: 5000
        });

        await connection.query('SELECT 1');
        await connection.end();

        connectionTest = {
          attempted: true,
          success: true,
          message: 'Connection successful!'
        };
      } catch (error: any) {
        connectionTest = {
          attempted: true,
          success: false,
          error: error.message,
          code: error.code,
          errno: error.errno,
          sqlState: error.sqlState
        };
      }
    }

    return NextResponse.json({
      success: true,
      env: {
        loaded: envLoaded,
        path: envPath,
        fileExists: envPath ? existsSync(envPath) : false,
        contentPreview: envContent ? envContent.substring(0, 200) : 'NOT FOUND',
        dbUrlFromFile: dbUrlFromFile ? dbUrlFromFile.substring(0, 50) + '...' : 'NOT FOUND',
        dbUrlFromEnv: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 50) + '...' : 'NOT SET',
        dbUrlParsed: dbUrlParsed,
        isBuildDefault: process.env.DATABASE_URL?.includes('build_user') || false
      },
      connectionTest: connectionTest,
      recommendations: connectionTest.attempted && !connectionTest.success ? [
        'Verifică că parola este corectă în panoul Hostinger',
        'Verifică că utilizatorul MySQL este corect',
        'Verifică că baza de date există',
        'Dacă parola conține caractere speciale, asigură-te că sunt URL-encoded în .env',
        'Verifică că utilizatorul are permisiuni pentru baza de date'
      ] : []
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

