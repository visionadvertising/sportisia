import { NextResponse } from 'next/server';
import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

export async function GET() {
  const cwd = process.cwd();
  const possiblePaths = [
    resolve(cwd, '.env'),
    resolve(cwd, 'public_html', '.env'),
    resolve(cwd, '..', '.env'),
    resolve(cwd, '..', 'public_html', '.env'),
    resolve('/home/u328389087/domains/lavender-cassowary-938357.hostingersite.com/public_html', '.env'),
  ];

  const results: any[] = [];
  let loadedEnv = false;

  for (const envPath of possiblePaths) {
    const exists = existsSync(envPath);
    results.push({
      path: envPath,
      exists,
      readable: exists ? (() => {
        try {
          const content = readFileSync(envPath, 'utf8');
          // Nu afișăm parola completă
          const sanitized = content.split('\n').map(line => {
            if (line.includes('DATABASE_URL')) {
              const parts = line.split('=');
              if (parts.length > 1) {
                const value = parts.slice(1).join('=');
                if (value.includes('@')) {
                  const [credentials, rest] = value.split('@');
                  if (credentials.includes(':')) {
                    const [user, ...passParts] = credentials.split(':');
                    const password = passParts.join(':');
                    return `${parts[0]}=${user}:${password.substring(0, 3)}***@${rest}`;
                  }
                }
                return `${parts[0]}=${value.substring(0, 20)}...`;
              }
            }
            return line;
          }).join('\n');
          return {
            hasContent: true,
            length: content.length,
            preview: sanitized.substring(0, 200)
          };
        } catch (error: any) {
          return { error: error.message };
        }
      })() : null
    });

    // Încearcă să încarce primul fișier găsit
    if (exists && !loadedEnv) {
      try {
        config({ path: envPath });
        loadedEnv = true;
        console.log('✅ Loaded .env from:', envPath);
      } catch (error: any) {
        console.log('⚠️ Error loading .env from:', envPath, error.message);
      }
    }
  }

  return NextResponse.json({
    success: true,
    currentWorkingDirectory: cwd,
    nodeEnv: process.env.NODE_ENV,
    databaseUrlAfterLoad: process.env.DATABASE_URL ? {
      isSet: true,
      length: process.env.DATABASE_URL.length,
      preview: process.env.DATABASE_URL.substring(0, 30) + '...'
    } : {
      isSet: false
    },
    envFileSearch: results,
    loadedFrom: loadedEnv ? results.find(r => r.exists && r.readable)?.path : null,
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('DB')).slice(0, 10)
  });
}

