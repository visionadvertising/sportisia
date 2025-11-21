import { NextResponse } from 'next/server';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

export async function GET() {
  const cwd = process.cwd();
  const possiblePaths = [
    resolve(cwd, '.env'),
    resolve(cwd, '.env.local'),
    resolve(cwd, '.env.production'),
    resolve('/home/u328389087/domains/lavender-cassowary-938357.hostingersite.com/public_html', '.env'),
  ];

  const results: any[] = [];

  for (const envPath of possiblePaths) {
    const exists = existsSync(envPath);
    let content = null;
    let error = null;

    if (exists) {
      try {
        content = readFileSync(envPath, 'utf8');
        // Verifică dacă conține DATABASE_URL
        const hasDatabaseUrl = content.includes('DATABASE_URL');
        const lines = content.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
        
        results.push({
          path: envPath,
          exists: true,
          readable: true,
          hasContent: content.length > 0,
          lineCount: lines.length,
          hasDatabaseUrl,
          firstLine: lines[0]?.substring(0, 50) || '',
          fileSize: content.length,
          // Nu afișăm conținutul complet din motive de securitate
        });
      } catch (err: any) {
        results.push({
          path: envPath,
          exists: true,
          readable: false,
          error: err.message
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

  const foundFile = results.find(r => r.exists && r.readable && r.hasDatabaseUrl);
  const currentDir = cwd;

  return NextResponse.json({
    success: true,
    currentWorkingDirectory: currentDir,
    envFileSearch: results,
    foundEnvFile: foundFile ? {
      path: foundFile.path,
      exists: true,
      hasDatabaseUrl: true
    } : null,
    instructions: foundFile ? {
      message: '✅ Fișierul .env a fost găsit!',
      nextStep: 'Dacă încă primești eroare, verifică că conținutul este corect'
    } : {
      message: '❌ Fișierul .env NU a fost găsit!',
      steps: [
        '1. Conectează-te via SSH la Hostinger',
        `2. Navighează la: cd ${currentDir}`,
        '3. Creează fișierul: nano .env',
        '4. Adaugă: DATABASE_URL=mysql://u328389087_sportisiaro_user:[PAROLA]@localhost:3306/u328389087_sportisiaro',
        '5. Salvează: Ctrl+X, apoi Y, apoi Enter',
        '6. Setează permisiunile: chmod 644 .env',
        '7. Verifică: cat .env'
      ],
      exactPath: resolve(currentDir, '.env')
    }
  });
}

