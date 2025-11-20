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
    
    // Asigură-te că baza de date este inițializată înainte de salvare
    try {
      const { ensureDatabaseInitialized } = await import('@/lib/prisma');
      await ensureDatabaseInitialized();
    } catch (initError: any) {
      console.error('Database initialization error:', initError);
      return NextResponse.json(
        { 
          error: 'Failed to initialize database',
          message: initError.message || 'Database initialization failed',
          details: 'Please try accessing /api/setup first to initialize the database'
        },
        { status: 500 }
      );
    }
    
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
    return NextResponse.json(
      { 
        error: 'Failed to create field',
        message: error.message || 'Unknown error occurred',
        errorType: error.constructor?.name,
        details: error.message
      },
      { status: 500 }
    );
  }
}

