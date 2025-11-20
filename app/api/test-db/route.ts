import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
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
      env: {
        databaseUrl: process.env.DATABASE_URL ? 'Setat' : 'Nu este setat',
        nodeEnv: process.env.NODE_ENV
      }
    });
  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Eroare la conexiunea cu baza de date',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        env: {
          databaseUrl: process.env.DATABASE_URL ? 'Setat' : 'Nu este setat',
          nodeEnv: process.env.NODE_ENV
        }
      },
      { status: 500 }
    );
  }
}

