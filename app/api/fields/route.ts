import { NextRequest, NextResponse } from 'next/server';
import { getAllFields, saveField } from '@/lib/data';
import { SportsField } from '@/lib/types';

export async function GET() {
  try {
    const fields = await getAllFields();
    return NextResponse.json(fields);
  } catch (error: any) {
    console.error('Error fetching fields:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch fields',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Nu mai apelăm ensureDatabaseInitialized() - lăsăm Prisma să gestioneze direct conexiunea
    // Dacă există probleme, Prisma va arunca eroarea reală
    
    const newField: SportsField = {
      id: crypto.randomUUID(),
      name: body.name,
      type: body.type,
      location: body.location,
      city: body.city,
      description: body.description || '',
      contactName: body.contactName,
      contactPhone: body.contactPhone,
      contactEmail: body.contactEmail,
      amenities: body.amenities || [],
      pricePerHour: body.pricePerHour,
      imageUrl: body.imageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const savedField = await saveField(newField);
    return NextResponse.json(savedField, { status: 201 });
  } catch (error: any) {
    console.error('Error creating field:', error);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    
    // Verifică dacă este eroare de autentificare
    if (error.message?.includes('Authentication failed') || 
        error.message?.includes('credentials') ||
        error.code === 'P1000' ||
        error.code === 'P1001') {
      return NextResponse.json(
        { 
          error: 'Database authentication failed',
          message: 'Credențialele bazei de date nu sunt valide. Verifică fișierul .env și permisiunile utilizatorului MySQL.',
          details: error.message,
          instructions: {
            step1: 'Verifică că fișierul .env există pe server',
            step2: 'Verifică că utilizatorul MySQL este asociat cu baza de date în panoul Hostinger',
            step3: 'Verifică că utilizatorul are toate permisiunile necesare'
          }
        },
        { status: 500 }
      );
    }
    
    // Verifică dacă tabelele nu există
    if (error.message?.includes('does not exist') || 
        error.message?.includes('Table') ||
        error.code === '42S02' ||
        error.code === 'ER_NO_SUCH_TABLE') {
      return NextResponse.json(
        { 
          error: 'Database tables not found',
          message: 'Tabelele bazei de date nu există. Te rugăm să accesezi /api/setup pentru a le crea.',
          details: error.message,
          instructions: {
            step1: 'Accesează: https://lavender-cassowary-938357.hostingersite.com/api/setup',
            step2: 'Aceasta va crea automat tabelele necesare',
            step3: 'După ce tabelele sunt create, încearcă din nou să adaugi terenul'
          }
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create field',
        message: error.message || 'Unknown error occurred',
        errorType: error.constructor?.name,
        errorCode: error.code,
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

