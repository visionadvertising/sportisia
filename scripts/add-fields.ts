import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const fields = [
  {
    name: 'Teren Central de Tenis',
    type: 'tenis',
    location: 'Str. Sportului nr. 10',
    city: 'București',
    description: 'Teren modern de tenis, bine întreținut, cu iluminat profesional. Suprafață sintetică de înaltă calitate.',
    contactName: 'Ion Popescu',
    contactPhone: '0721234567',
    contactEmail: 'contact@terencentral.ro',
    amenities: JSON.stringify(['Vestiar', 'Dusuri', 'Parcare', 'Iluminat', 'Restaurant']),
    pricePerHour: 80,
    imageUrl: 'https://images.unsplash.com/photo-1622163642999-7c297330a160?w=800'
  },
  {
    name: 'Arena Fotbal Premium',
    type: 'fotbal',
    location: 'Bd. Victoriei nr. 25',
    city: 'Cluj-Napoca',
    description: 'Teren de fotbal premium cu iarbă naturală, perfect pentru antrenamente și meciuri. Facilități complete disponibile.',
    contactName: 'Maria Ionescu',
    contactPhone: '0722345678',
    contactEmail: 'info@arenafotbal.ro',
    amenities: JSON.stringify(['Vestiar', 'Dusuri', 'Parcare', 'Iluminat', 'Tribune']),
    pricePerHour: 120,
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800'
  },
  {
    name: 'Complex Sportiv Baschet',
    type: 'baschet',
    location: 'Calea Unirii nr. 15',
    city: 'Timișoara',
    description: 'Sala modernă de baschet cu parchet profesional, ideal pentru antrenamente și competiții. Echipament complet inclus.',
    contactName: 'Alexandru Georgescu',
    contactPhone: '0723456789',
    contactEmail: 'contact@complexbaschet.ro',
    amenities: JSON.stringify(['Vestiar', 'Dusuri', 'Parcare', 'Iluminat', 'Echipament inclus', 'WiFi']),
    pricePerHour: 100,
    imageUrl: 'https://images.unsplash.com/photo-1519869325934-21d5c8e5e1e3?w=800'
  },
  {
    name: 'Teren Volei Municipal',
    type: 'volei',
    location: 'Str. Libertății nr. 8',
    city: 'Iași',
    description: 'Teren de volei în aer liber, cu net profesional și iluminat pentru seara. Perfect pentru echipe și antrenamente.',
    contactName: 'Elena Radu',
    contactPhone: '0724567890',
    contactEmail: 'info@terenvolei.ro',
    amenities: JSON.stringify(['Vestiar', 'Dusuri', 'Parcare', 'Iluminat']),
    pricePerHour: 60,
    imageUrl: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800'
  },
  {
    name: 'Arena Handbal Elite',
    type: 'handbal',
    location: 'Bd. Republicii nr. 42',
    city: 'Constanța',
    description: 'Sala modernă de handbal cu parchet profesional și tribune. Facilități de top pentru competiții și antrenamente.',
    contactName: 'Mihai Constantinescu',
    contactPhone: '0725678901',
    contactEmail: 'contact@arenahandbal.ro',
    amenities: JSON.stringify(['Vestiar', 'Dusuri', 'Parcare', 'Iluminat', 'Tribune', 'Aer condiționat']),
    pricePerHour: 90,
    imageUrl: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800'
  }
];

async function addFields() {
  console.log('🏟️  Adding 5 fields to database...');
  
  try {
    for (const field of fields) {
      await prisma.sportsField.create({
        data: field
      });
      console.log(`✅ Added: ${field.name} (${field.type})`);
    }
    
    console.log('🎉 Successfully added 5 fields!');
  } catch (error) {
    console.error('❌ Error adding fields:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addFields();

