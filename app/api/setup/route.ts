import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const sampleFields = [
  {
    name: 'Teren Central de Tenis',
    type: 'tenis',
    location: 'Str. Sportului nr. 10',
    city: 'București',
    description: 'Teren modern de tenis, bine întreținut, cu iluminat profesional.',
    contactName: 'Ion Popescu',
    contactPhone: '0721234567',
    contactEmail: 'contact@terencentral.ro',
    amenities: JSON.stringify(['Vestiar', 'Dusuri', 'Parcare', 'Iluminat']),
    pricePerHour: 80,
  },
  {
    name: 'Arena Fotbal Premium',
    type: 'fotbal',
    location: 'Bd. Victoriei nr. 25',
    city: 'Cluj-Napoca',
    description: 'Teren de fotbal premium cu iarbă naturală, perfect pentru antrenamente.',
    contactName: 'Maria Ionescu',
    contactPhone: '0722345678',
    contactEmail: 'info@arenafotbal.ro',
    amenities: JSON.stringify(['Vestiar', 'Dusuri', 'Parcare', 'Iluminat', 'Tribune']),
    pricePerHour: 120,
  },
  {
    name: 'Complex Sportiv Baschet',
    type: 'baschet',
    location: 'Calea Unirii nr. 15',
    city: 'Timișoara',
    description: 'Sala modernă de baschet cu parchet profesional, ideal pentru antrenamente.',
    contactName: 'Alexandru Georgescu',
    contactPhone: '0723456789',
    contactEmail: 'contact@complexbaschet.ro',
    amenities: JSON.stringify(['Vestiar', 'Dusuri', 'Parcare', 'Iluminat', 'Echipament inclus']),
    pricePerHour: 100,
  },
  {
    name: 'Teren Volei Municipal',
    type: 'volei',
    location: 'Str. Libertății nr. 8',
    city: 'Iași',
    description: 'Teren de volei în aer liber, cu net profesional și iluminat.',
    contactName: 'Elena Radu',
    contactPhone: '0724567890',
    contactEmail: 'info@terenvolei.ro',
    amenities: JSON.stringify(['Vestiar', 'Dusuri', 'Parcare', 'Iluminat']),
    pricePerHour: 60,
  },
  {
    name: 'Arena Handbal Elite',
    type: 'handbal',
    location: 'Bd. Republicii nr. 42',
    city: 'Constanța',
    description: 'Sala modernă de handbal cu parchet profesional și tribune.',
    contactName: 'Mihai Constantinescu',
    contactPhone: '0725678901',
    contactEmail: 'contact@arenahandbal.ro',
    amenities: JSON.stringify(['Vestiar', 'Dusuri', 'Parcare', 'Iluminat', 'Tribune', 'Aer condiționat']),
    pricePerHour: 90,
  },
]

export async function GET() {
  try {
    // Verifică dacă există deja terenuri
    const existingFields = await prisma.sportsField.findMany()
    
    if (existingFields.length > 0) {
      return NextResponse.json({
        success: true,
        message: `Baza de date conține deja ${existingFields.length} terenuri.`,
        fieldsCount: existingFields.length,
      })
    }

    // Adaugă terenurile
    const createdFields = []
    for (const field of sampleFields) {
      const created = await prisma.sportsField.create({
        data: field,
      })
      createdFields.push(created)
    }

    return NextResponse.json({
      success: true,
      message: `Au fost adăugate ${createdFields.length} terenuri!`,
      fieldsCount: createdFields.length,
    })
  } catch (error: any) {
    console.error('Setup error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Eroare: ' + error.message,
        error: error.message,
      },
      { status: 500 }
    )
  }
}
