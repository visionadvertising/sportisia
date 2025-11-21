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
          password: url.password ? (url.password.length > 0 ? url.password.substring(0, 3) + '***' : 'EMPTY') : 'NOT SET',
          passwordLength: url.password ? url.password.length : 0,
          host: url.hostname,
          port: url.port || '3306',
          database: url.pathname.substring(1), // Remove leading /
          full: process.env.DATABASE_URL
        };
      } catch (error: any) {
        dbUrlParsed = { error: error.message };
      }
    }

    return NextResponse.json({
      success: true,
      env: {
        loaded: envLoaded,
        path: envPath,
        fileExists: envPath ? existsSync(envPath) : false,
        contentPreview: envContent ? envContent.substring(0, 300) : 'NOT FOUND',
        dbUrlFromFile: dbUrlFromFile || 'NOT FOUND',
        dbUrlFromEnv: process.env.DATABASE_URL || 'NOT SET',
        dbUrlParsed: dbUrlParsed,
        isBuildDefault: process.env.DATABASE_URL?.includes('build_user') || false,
        currentWorkingDir: process.cwd()
      },
      recommendations: [
        'Verifică că utilizatorul MySQL este exact: u328389087_sportisiaro_us',
        'Verifică că parola este exact: Csl19920903',
        'Verifică că baza de date este exact: u328389087_sportisiaro',
        'Dacă parola conține caractere speciale, asigură-te că sunt URL-encoded în .env',
        'Verifică în panoul Hostinger că utilizatorul are permisiuni pentru baza de date'
      ]
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

