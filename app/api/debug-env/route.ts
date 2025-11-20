import { NextResponse } from 'next/server';

export async function GET() {
  // Afișează toate variabilele de mediu disponibile
  const allEnv = process.env;
  const databaseRelated = Object.keys(allEnv).filter(key => 
    key.includes('DATABASE') || 
    key.includes('DB') || 
    key.includes('MYSQL') ||
    key.includes('POSTGRES')
  );

  const envInfo: Record<string, any> = {};
  databaseRelated.forEach(key => {
    const value = allEnv[key];
    if (value) {
      // Nu afișăm parola completă din motive de securitate
      if (value.includes('@')) {
        const parts = value.split('@');
        if (parts[0].includes(':')) {
          const [protocol, credentials] = parts[0].split('://');
          const [user, ...passParts] = credentials.split(':');
          const password = passParts.join(':');
          envInfo[key] = {
            protocol,
            user,
            passwordLength: password.length,
            passwordPreview: password.substring(0, 3) + '...',
            host: parts[1]?.split('/')[0] || 'N/A',
            fullValue: value.substring(0, 50) + '...'
          };
        } else {
          envInfo[key] = value.substring(0, 50) + '...';
        }
      } else {
        envInfo[key] = value.substring(0, 50) + '...';
      }
    } else {
      envInfo[key] = 'NOT SET';
    }
  });

  return NextResponse.json({
    success: true,
    message: 'Environment variables debug info',
    debug: {
      DATABASE_URL: process.env.DATABASE_URL ? {
        isSet: true,
        length: process.env.DATABASE_URL.length,
        startsWith: process.env.DATABASE_URL.substring(0, 10),
        endsWith: process.env.DATABASE_URL.substring(process.env.DATABASE_URL.length - 10),
        preview: process.env.DATABASE_URL.substring(0, 30) + '...'
      } : {
        isSet: false
      },
      NODE_ENV: process.env.NODE_ENV,
      allDatabaseRelated: envInfo,
      allEnvKeysCount: Object.keys(allEnv).length,
      databaseRelatedKeys: databaseRelated
    },
    instructions: {
      note: 'Dacă DATABASE_URL nu este setat, verifică în panoul Hostinger:',
      step1: 'Management > Websites > [site-ul tău] > Environment Variables',
      step2: 'Asigură-te că ai salvat setările (click pe "Save")',
      step3: 'Declanșează un rebuild manual după salvare',
      step4: 'Verifică logurile aplicației pentru erori'
    }
  });
}

