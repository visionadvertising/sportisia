import { NextRequest, NextResponse } from 'next/server';
import { getCoachById, saveCoach, deleteCoach } from '@/lib/data';
import { Coach } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const coach = await getCoachById(params.id);
    
    if (!coach) {
      return NextResponse.json(
        { error: 'Coach not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(coach);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch coach' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const existingCoach = await getCoachById(params.id);
    
    if (!existingCoach) {
      return NextResponse.json(
        { error: 'Coach not found' },
        { status: 404 }
      );
    }

    const updatedCoach: Coach = {
      ...existingCoach,
      ...body,
      id: params.id,
      updatedAt: new Date().toISOString(),
    };

    const savedCoach = await saveCoach(updatedCoach);
    return NextResponse.json(savedCoach);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update coach' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await deleteCoach(params.id);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Coach not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete coach' },
      { status: 500 }
    );
  }
}


