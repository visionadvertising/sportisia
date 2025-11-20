import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const cities = [
  'București', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Constanța',
  'Craiova', 'Brașov', 'Galați', 'Ploiești', 'Oradea',
  'Brăila', 'Arad', 'Pitești', 'Sibiu', 'Bacău',
  'Târgu Mureș', 'Baia Mare', 'Buzău', 'Botoșani', 'Satu Mare'
];

const sports = ['tenis', 'fotbal', 'baschet', 'volei', 'handbal', 'alte'];

const fieldNames = [
  'Teren Central', 'Arena Sport', 'Complex Sportiv', 'Teren Premium',
  'Stadion Municipal', 'Teren Modern', 'Arena Elite', 'Complex Athletic',
  'Teren Profesionist', 'Centru Sportiv', 'Teren VIP', 'Arena Gold',
  'Teren Standard', 'Complex Fitness', 'Arena Pro', 'Teren Classic'
];

const coachNames = [
  'Ion Popescu', 'Maria Ionescu', 'Alexandru Georgescu', 'Elena Radu',
  'Mihai Constantinescu', 'Ana Dumitrescu', 'Radu Stanciu', 'Cristina Nistor',
  'Andrei Munteanu', 'Laura Gheorghe', 'Florin Dragomir', 'Andreea Marin',
  'Bogdan Iordache', 'Diana Stoica', 'Cătălin Popa', 'Ioana Tudor',
  'Daniel Vasile', 'Raluca Petre', 'Adrian Neagu', 'Simona Călin'
];

const locations = [
  'Str. Sportului nr. 10', 'Bd. Victoriei nr. 25', 'Calea Unirii nr. 15',
  'Str. Libertății nr. 8', 'Bd. Republicii nr. 42', 'Str. Mihai Eminescu nr. 30',
  'Calea Dorobanților nr. 12', 'Str. Nicolae Bălcescu nr. 5', 'Bd. Independenței nr. 20',
  'Str. Gheorghe Doja nr. 18', 'Calea Moșilor nr. 7', 'Str. Horea nr. 22'
];

const descriptions = [
  'Teren modern, bine întreținut, cu iluminat profesional.',
  'Complex sportiv de înaltă calitate, ideal pentru antrenamente și competiții.',
  'Teren premium cu suprafață sintetică de ultimă generație.',
  'Facilități complete: vestiar, dusuri, parcare, restaurant.',
  'Teren profesional, certificat pentru competiții oficiale.',
  'Arena modernă cu tehnologie avansată și confort maxim.',
  'Teren clasic, bine întreținut, cu tradiție în sport.',
  'Complex complet cu toate facilitățile necesare.',
  'Teren accesibil, perfect pentru amatori și profesioniști.',
  'Arena de top cu standarde internaționale.'
];

const coachDescriptions = [
  'Antrenor certificat cu experiență în sportul de performanță.',
  'Specializat în dezvoltarea tehnică și tactică a jucătorilor.',
  'Fost jucător profesionist, acum dedicat antrenării.',
  'Metodă modernă de antrenament, adaptată la fiecare elev.',
  'Experiență vastă în pregătirea sportivilor de toate nivelurile.',
  'Antrenor pasionat, focus pe progresul individual.',
  'Specializat în pregătirea juniorilor și a debutanților.',
  'Tehnici avansate de antrenament pentru performanță maximă.',
  'Abordare personalizată, adaptată la nevoile fiecărui sportiv.',
  'Antrenor dedicat cu rezultate dovedite în competiții.'
];

const experienceTexts = [
  '10+ ani experiență', '15 ani experiență, fost jucător profesionist',
  '8 ani experiență, certificat internațional', '12 ani experiență în antrenament',
  '20+ ani experiență, antrenor de performanță', '5 ani experiență, specializat în juniori',
  '18 ani experiență, multiple titluri', '7 ani experiență, metodă modernă'
];

const amenities = [
  ['Vestiar', 'Dusuri', 'Parcare'],
  ['Vestiar', 'Dusuri', 'Parcare', 'Iluminat'],
  ['Vestiar', 'Dusuri', 'Parcare', 'Iluminat', 'Restaurant/Cafenea'],
  ['Vestiar', 'Dusuri', 'Parcare', 'Iluminat', 'Echipament inclus'],
  ['Vestiar', 'Dusuri', 'Parcare', 'Iluminat', 'WiFi', 'Aer condiționat'],
  ['Vestiar', 'Dusuri', 'Parcare', 'Iluminat', 'Restaurant/Cafenea', 'Echipament inclus']
];

const qualifications = [
  ['Licență antrenor'],
  ['Licență antrenor', 'Diplomă universitară'],
  ['Licență antrenor', 'Certificat internațional'],
  ['Licență antrenor', 'Diplomă universitară', 'Experiență competițională'],
  ['Licență antrenor', 'Certificat internațional', 'Specializare tehnică'],
  ['Licență antrenor', 'Diplomă universitară', 'Prim ajutor']
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomPrice(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seed() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.coach.deleteMany();
  await prisma.sportsField.deleteMany();
  console.log('✅ Cleared existing data');

  // Create fields (60 items)
  const fields = [];
  for (let i = 0; i < 60; i++) {
    const city = getRandomElement(cities);
    const sport = getRandomElement(sports);
    const field = {
      name: `${getRandomElement(fieldNames)} ${i + 1}`,
      type: sport,
      location: getRandomElement(locations),
      city: city,
      description: getRandomElement(descriptions),
      contactName: getRandomElement(coachNames),
      contactPhone: `07${Math.floor(Math.random() * 9000000) + 1000000}`,
      contactEmail: `contact${i}@example.com`,
      amenities: JSON.stringify(getRandomElement(amenities)),
      pricePerHour: Math.random() > 0.3 ? getRandomPrice(30, 150) : null,
      imageUrl: Math.random() > 0.7 ? `https://picsum.photos/800/600?random=${i}` : null,
    };
    fields.push(field);
  }

  await prisma.sportsField.createMany({ data: fields });
  console.log(`✅ Created ${fields.length} fields`);

  // Create coaches (40 items)
  const coaches = [];
  for (let i = 0; i < 40; i++) {
    const city = getRandomElement(cities);
    const sport = getRandomElement(sports);
    const coach = {
      name: getRandomElement(coachNames),
      sport: sport,
      city: city,
      location: Math.random() > 0.5 ? getRandomElement(locations) : null,
      description: getRandomElement(coachDescriptions),
      experience: getRandomElement(experienceTexts),
      qualifications: JSON.stringify(getRandomElement(qualifications)),
      contactName: getRandomElement(coachNames),
      contactPhone: `07${Math.floor(Math.random() * 9000000) + 1000000}`,
      contactEmail: `antrenor${i}@example.com`,
      pricePerHour: Math.random() > 0.2 ? getRandomPrice(50, 200) : null,
      imageUrl: Math.random() > 0.7 ? `https://picsum.photos/800/600?random=${i + 100}` : null,
    };
    coaches.push(coach);
  }

  await prisma.coach.createMany({ data: coaches });
  console.log(`✅ Created ${coaches.length} coaches`);

  console.log('🎉 Seeding completed!');
}

seed()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


