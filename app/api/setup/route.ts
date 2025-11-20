import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

export async function GET() {
  try {
    // Asigură-te că baza de date este inițializată
    const { ensureDatabaseInitialized } = await import('@/lib/prisma');
    
    try {
      await ensureDatabaseInitialized();
    } catch (initError: any) {
      // Dacă DATABASE_URL este setat la SQLite sau invalid
      if (initError.message?.includes('SQLite') || 
          initError.message?.includes('must start with "mysql://"') ||
          initError.message?.includes('DATABASE_URL environment variable is not set')) {
        return NextResponse.json(
          {
            success: false,
            message: 'DATABASE_URL nu este configurat corect pentru MySQL.',
            error: initError.message,
            instructions: {
              step1: 'Intră în panoul Hostinger',
              step2: 'Navighează la: Management > Websites > [site-ul tău] > Environment Variables',
              step3: 'Adaugă variabila:',
              step4: '  Nume: DATABASE_URL',
              step5: '  Valoare: mysql://u328389087_sportisiaro_user:parola123@localhost:3306/u328389087_sportisiaro',
              step6: '  (Înlocuiește cu datele tale reale din baza de date MySQL)',
              step7: 'După ce setezi DATABASE_URL, declanșează un rebuild',
              documentation: 'Vezi MYSQL_SETUP.md pentru instrucțiuni detaliate'
            }
          },
          { status: 500 }
        );
      }
      
      // Dacă tabelele nu există, oferă instrucțiuni clare
      if (initError.message?.includes('Database tables not found') || 
          initError.message?.includes('does not exist') ||
          initError.code === '42P01' ||
          initError.code === '42S02' ||
          initError.code === 'ER_NO_SUCH_TABLE') {
        return NextResponse.json(
          {
            success: false,
            message: 'Tabelele bazei de date nu există. Accesează /api/db-push pentru a le crea automat.',
            error: initError.message,
            instructions: {
              viaAPI: 'Accesează: https://lavender-cassowary-938357.hostingersite.com/api/db-push',
              viaSSH: 'Rulează: npm run db:push (dacă npm este disponibil)',
              note: 'Endpoint-ul /api/db-push va crea tabelele automat fără să fie nevoie de npm'
            }
          },
          { status: 500 }
        );
      }
      throw initError;
    }
    
    // Încearcă să creeze tabelele dacă nu există
    try {
      // Verifică dacă tabelele există
      await prisma.$queryRaw`SELECT 1 FROM \`SportsField\` LIMIT 1`;
    } catch (tableError: any) {
      // Dacă tabelele nu există, le creează
      if (tableError.code === '42S02' || tableError.code === 'ER_NO_SUCH_TABLE' || 
          tableError.message?.includes('does not exist') || tableError.message?.includes('Table')) {
        console.log('🔄 Creating database tables...');
        
        // Creează tabelele manual
        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS \`SportsField\` (
            \`id\` VARCHAR(191) NOT NULL,
            \`name\` VARCHAR(191) NOT NULL,
            \`type\` VARCHAR(191) NOT NULL,
            \`location\` VARCHAR(191) NOT NULL,
            \`city\` VARCHAR(191) NOT NULL,
            \`description\` VARCHAR(191) NOT NULL DEFAULT '',
            \`contactName\` VARCHAR(191) NOT NULL,
            \`contactPhone\` VARCHAR(191) NOT NULL,
            \`contactEmail\` VARCHAR(191) NOT NULL,
            \`amenities\` VARCHAR(191) NOT NULL DEFAULT '[]',
            \`pricePerHour\` DOUBLE,
            \`imageUrl\` VARCHAR(191),
            \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
            \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
            PRIMARY KEY (\`id\`)
          ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        `);

        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS \`Coach\` (
            \`id\` VARCHAR(191) NOT NULL,
            \`name\` VARCHAR(191) NOT NULL,
            \`sport\` VARCHAR(191) NOT NULL,
            \`city\` VARCHAR(191) NOT NULL,
            \`location\` VARCHAR(191),
            \`description\` VARCHAR(191) NOT NULL DEFAULT '',
            \`experience\` VARCHAR(191) NOT NULL DEFAULT '',
            \`qualifications\` VARCHAR(191) NOT NULL DEFAULT '[]',
            \`contactName\` VARCHAR(191) NOT NULL,
            \`contactPhone\` VARCHAR(191) NOT NULL,
            \`contactEmail\` VARCHAR(191) NOT NULL,
            \`pricePerHour\` DOUBLE,
            \`imageUrl\` VARCHAR(191),
            \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
            \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
            PRIMARY KEY (\`id\`)
          ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        `);

        // Creează indexurile
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS \`SportsField_type_idx\` ON \`SportsField\`(\`type\`);`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS \`SportsField_city_idx\` ON \`SportsField\`(\`city\`);`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS \`Coach_sport_idx\` ON \`Coach\`(\`sport\`);`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS \`Coach_city_idx\` ON \`Coach\`(\`city\`);`);
        
        console.log('✅ Database tables created successfully');
      } else {
        throw tableError;
      }
    }
    
    // Verifică dacă terenurile există deja
    const existingFields = await prisma.sportsField.findMany();
    
    if (existingFields.length > 0) {
      return NextResponse.json({
        success: true,
        message: `Baza de date este inițializată și conține deja ${existingFields.length} terenuri.`,
        fieldsCount: existingFields.length,
        databaseInitialized: true
      });
    }

    // Adaugă terenurile
    const createdFields = [];
    for (const field of fields) {
      try {
        const created = await prisma.sportsField.create({
          data: field
        });
        createdFields.push(created);
      } catch (error: any) {
        console.error(`Error creating field ${field.name}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Baza de date a fost inițializată și au fost adăugate ${createdFields.length} terenuri!`,
      fieldsCount: createdFields.length,
      databaseInitialized: true,
      fields: createdFields.map(f => ({ id: f.id, name: f.name, type: f.type, city: f.city }))
    });
  } catch (error: any) {
    console.error('Error in setup:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Eroare la inițializarea bazei de date: ' + error.message,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

