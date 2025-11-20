import { NextRequest, NextResponse } from 'next/server';
import { getFieldById, saveField, deleteField } from '@/lib/data';
import { SportsField } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const field = await getFieldById(params.id);
    
    if (!field) {
      return NextResponse.json(
        { error: 'Field not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(field);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch field' },
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
    const existingField = await getFieldById(params.id);
    
    if (!existingField) {
      return NextResponse.json(
        { error: 'Field not found' },
        { status: 404 }
      );
    }

    const updatedField: SportsField = {
      ...existingField,
      ...body,
      id: params.id,
      updatedAt: new Date().toISOString(),
    };

    const savedField = await saveField(updatedField);
    return NextResponse.json(savedField);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update field' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await deleteField(params.id);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Field not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete field' },
      { status: 500 }
    );
  }
}

