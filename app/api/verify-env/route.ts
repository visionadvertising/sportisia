import { NextResponse } from 'next/server';
import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

export async function GET() {
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

  const results: any[] = [];
  let loadedEnv = false;
  let loadedPath: string | null = null;

  for (const envPath of possiblePaths) {
    const exists = existsSync(envPath);
    let content = null;
    
    if (exists) {
      try {
        content = readFileSync(envPath, 'utf8');
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
        
        // Încearcă să încarce primul fișier găsit
        if (!loadedEnv) {
          try {
            config({ path: envPath });
            loadedEnv = true;
            loadedPath = envPath;
            console.log('✅ Loaded .env from:', envPath);
          } catch (error: any) {
            console.log('⚠️ Error loading .env from:', envPath, error.message);
          }
        }
        
        results.push({
          path: envPath,
          exists: true,
          readable: true,
          content: {
            hasContent: true,
            length: content.length,
            preview: sanitized.substring(0, 300),
            hasDatabaseUrl: content.includes('DATABASE_URL')
          }
        });
      } catch (error: any) {
        results.push({
          path: envPath,
          exists: true,
          readable: false,
          error: error.message
        });
      }
    } else {
      results.push({
        path: envPath,
        exists: false,
        readable: false
      });
    }
  }

  return NextResponse.json({
    success: true,
    currentWorkingDirectory: cwd,
    nodeEnv: process.env.NODE_ENV,
    databaseUrlBeforeLoad: process.env.DATABASE_URL ? {
      isSet: true,
      length: process.env.DATABASE_URL.length,
      preview: process.env.DATABASE_URL.substring(0, 30) + '...'
    } : {
      isSet: false
    },
    databaseUrlAfterLoad: process.env.DATABASE_URL ? {
      isSet: true,
      length: process.env.DATABASE_URL.length,
      preview: process.env.DATABASE_URL.substring(0, 30) + '...'
    } : {
      isSet: false
    },
    envFileSearch: results,
    loadedFrom: loadedPath,
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('DB')).slice(0, 10),
    instructions: loadedEnv ? {
      message: '✅ .env file loaded successfully!',
      nextStep: 'Try accessing /api/setup or /api/fields again'
    } : {
      message: '❌ .env file not found',
      steps: [
        '1. Connect via SSH to your Hostinger server',
        '2. Navigate to: cd /home/u328389087/domains/lavender-cassowary-938357.hostingersite.com/public_html',
        '3. Create .env file: nano .env',
        '4. Add: DATABASE_URL=mysql://u328389087_sportisiaro_user:[password]@localhost:3306/u328389087_sportisiaro',
        '5. Save and exit (Ctrl+X, then Y, then Enter)',
        '6. Set permissions: chmod 644 .env',
        '7. Restart the application or wait for next request'
      ]
    }
  });
}

