import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  // Debug: afișează toate variabilele de mediu disponibile
  const envVars = {
    DATABASE_URL: process.env.DATABASE_URL ? 
      process.env.DATABASE_URL.substring(0, 30) + '...' : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('DB'))
  };
  try {
    // Testează conexiunea la baza de date
    await prisma.$connect();
    
    // Verifică dacă tabelele există
    const fieldsCount = await prisma.sportsField.count();
    const coachesCount = await prisma.coach.count();
    
    // Verifică dacă baza de date este accesibilă
    const testQuery = await prisma.$queryRaw`SELECT 1 as test`;
    
    return NextResponse.json({
      success: true,
      message: 'Baza de date funcționează corect!',
      database: {
        connected: true,
        fieldsCount,
        coachesCount,
        testQuery: Array.isArray(testQuery) ? testQuery.map((row: any) => ({ test: Number(row.test) })) : testQuery
      },
      env: envVars
    });
  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Eroare la conexiunea cu baza de date',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        env: envVars,
        debug: {
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          databaseUrlLength: process.env.DATABASE_URL?.length || 0,
          databaseUrlStart: process.env.DATABASE_URL?.substring(0, 20) || 'N/A'
        }
      },
      { status: 500 }
    );
  }
}

