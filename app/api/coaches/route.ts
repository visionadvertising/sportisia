import { NextRequest, NextResponse } from 'next/server';
import { getAllCoaches, saveCoach } from '@/lib/data';
import { Coach } from '@/lib/types';

export async function GET() {
  try {
    const coaches = await getAllCoaches();
    return NextResponse.json(coaches);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch coaches' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newCoach: Coach = {
      id: crypto.randomUUID(),
      name: body.name,
      sport: body.sport,
      city: body.city,
      location: body.location,
      description: body.description || '',
      experience: body.experience || '',
      qualifications: body.qualifications || [],
      contactName: body.contactName,
      contactPhone: body.contactPhone,
      contactEmail: body.contactEmail,
      pricePerHour: body.pricePerHour,
      imageUrl: body.imageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const savedCoach = await saveCoach(newCoach);
    return NextResponse.json(savedCoach, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create coach' },
      { status: 500 }
    );
  }
}


