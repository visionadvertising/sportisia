import { SportsField, Coach } from './types';
import { prisma } from './prisma';

export async function getAllFields(): Promise<SportsField[]> {
  try {
    // Asigură-te că baza de date este inițializată
    try {
      const { ensureDatabaseInitialized } = await import('./prisma');
      await ensureDatabaseInitialized();
    } catch (initError: any) {
      console.error('Database initialization error in getAllFields:', initError);
      // Dacă inițializarea eșuează, returnează array gol în loc să arunce eroare
      // Astfel aplicația poate continua să funcționeze
      return [];
    }
    
    // Adaugă timeout pentru query
    const queryPromise = prisma.sportsField.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Query timeout')), 5000)
    );
    
    const fields = await Promise.race([queryPromise, timeoutPromise]);
    
    return fields.map(field => ({
      id: field.id,
      name: field.name,
      type: field.type as SportsField['type'],
      location: field.location,
      city: field.city,
      description: field.description,
      contactName: field.contactName,
      contactPhone: field.contactPhone,
      contactEmail: field.contactEmail,
      amenities: JSON.parse(field.amenities || '[]') as string[],
      pricePerHour: field.pricePerHour ?? undefined,
      imageUrl: field.imageUrl ?? undefined,
      createdAt: field.createdAt.toISOString(),
      updatedAt: field.updatedAt.toISOString(),
    }));
  } catch (error: any) {
    console.error('Error reading fields:', error);
    // Returnează array gol în loc să arunce eroare
    // Astfel aplicația poate continua să funcționeze chiar dacă baza de date are probleme
    return [];
  }
}

export async function getFieldById(id: string): Promise<SportsField | null> {
  try {
    const field = await prisma.sportsField.findUnique({
      where: { id },
    });

    if (!field) {
      return null;
    }

    return {
      id: field.id,
      name: field.name,
      type: field.type as SportsField['type'],
      location: field.location,
      city: field.city,
      description: field.description,
      contactName: field.contactName,
      contactPhone: field.contactPhone,
      contactEmail: field.contactEmail,
      amenities: JSON.parse(field.amenities || '[]') as string[],
      pricePerHour: field.pricePerHour ?? undefined,
      imageUrl: field.imageUrl ?? undefined,
      createdAt: field.createdAt.toISOString(),
      updatedAt: field.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('Error reading field:', error);
    return null;
  }
}

export async function saveField(field: SportsField): Promise<SportsField> {
  try {
    // Asigură-te că baza de date este inițializată înainte de salvare
    try {
      const { ensureDatabaseInitialized } = await import('./prisma');
      await ensureDatabaseInitialized();
    } catch (initError: any) {
      console.error('Database initialization error in saveField:', initError);
      
      // Dacă tabelele nu există, încearcă să le creeze automat
      if (initError.message?.includes('does not exist') || 
          initError.message?.includes('Table') ||
          initError.code === '42S02' ||
          initError.code === 'ER_NO_SUCH_TABLE') {
        console.log('🔄 Tables do not exist, creating them automatically...');
        
        try {
          // Creează tabelele direct
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
            CREATE INDEX IF NOT EXISTS \`SportsField_type_idx\` ON \`SportsField\`(\`type\`);
          `);

          await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS \`SportsField_city_idx\` ON \`SportsField\`(\`city\`);
          `);

          console.log('✅ Tables created successfully, retrying save...');
        } catch (createError: any) {
          console.error('❌ Failed to create tables:', createError);
          throw new Error('Baza de date nu a putut fi inițializată. Te rugăm să accesezi /api/setup pentru a crea tabelele: ' + createError.message);
        }
      } else {
        throw new Error('Baza de date nu a putut fi inițializată: ' + (initError.message || 'Unknown error'));
      }
    }
    
    const data = {
      name: field.name,
      type: field.type,
      location: field.location,
      city: field.city,
      description: field.description,
      contactName: field.contactName,
      contactPhone: field.contactPhone,
      contactEmail: field.contactEmail,
      amenities: JSON.stringify(field.amenities || []),
      pricePerHour: field.pricePerHour ?? null,
      imageUrl: field.imageUrl ?? null,
    };

    // Check if field exists
    const existingField = field.id ? await prisma.sportsField.findUnique({
      where: { id: field.id },
    }) : null;

    const savedField = existingField
      ? await prisma.sportsField.update({
          where: { id: field.id },
          data,
        })
      : await prisma.sportsField.create({
          data: {
            ...data,
            id: field.id || undefined, // Prisma will generate UUID if not provided
          },
        });

    return {
      id: savedField.id,
      name: savedField.name,
      type: savedField.type as SportsField['type'],
      location: savedField.location,
      city: savedField.city,
      description: savedField.description,
      contactName: savedField.contactName,
      contactPhone: savedField.contactPhone,
      contactEmail: savedField.contactEmail,
      amenities: JSON.parse(savedField.amenities || '[]') as string[],
      pricePerHour: savedField.pricePerHour ?? undefined,
      imageUrl: savedField.imageUrl ?? undefined,
      createdAt: savedField.createdAt.toISOString(),
      updatedAt: savedField.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('Error saving field:', error);
    throw error;
  }
}

export async function deleteField(id: string): Promise<boolean> {
  try {
    await prisma.sportsField.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error('Error deleting field:', error);
    return false;
  }
}

// Coach functions
export async function getAllCoaches(): Promise<Coach[]> {
  try {
    const coaches = await prisma.coach.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    return coaches.map(coach => ({
      id: coach.id,
      name: coach.name,
      sport: coach.sport as Coach['sport'],
      city: coach.city,
      location: coach.location ?? undefined,
      description: coach.description,
      experience: coach.experience,
      qualifications: JSON.parse(coach.qualifications || '[]') as string[],
      contactName: coach.contactName,
      contactPhone: coach.contactPhone,
      contactEmail: coach.contactEmail,
      pricePerHour: coach.pricePerHour ?? undefined,
      imageUrl: coach.imageUrl ?? undefined,
      createdAt: coach.createdAt.toISOString(),
      updatedAt: coach.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error reading coaches:', error);
    return [];
  }
}

export async function getCoachById(id: string): Promise<Coach | null> {
  try {
    const coach = await prisma.coach.findUnique({
      where: { id },
    });

    if (!coach) {
      return null;
    }

    return {
      id: coach.id,
      name: coach.name,
      sport: coach.sport as Coach['sport'],
      city: coach.city,
      location: coach.location ?? undefined,
      description: coach.description,
      experience: coach.experience,
      qualifications: JSON.parse(coach.qualifications || '[]') as string[],
      contactName: coach.contactName,
      contactPhone: coach.contactPhone,
      contactEmail: coach.contactEmail,
      pricePerHour: coach.pricePerHour ?? undefined,
      imageUrl: coach.imageUrl ?? undefined,
      createdAt: coach.createdAt.toISOString(),
      updatedAt: coach.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('Error reading coach:', error);
    return null;
  }
}

export async function saveCoach(coach: Coach): Promise<Coach> {
  try {
    const data = {
      name: coach.name,
      sport: coach.sport,
      city: coach.city,
      location: coach.location ?? null,
      description: coach.description,
      experience: coach.experience,
      qualifications: JSON.stringify(coach.qualifications || []),
      contactName: coach.contactName,
      contactPhone: coach.contactPhone,
      contactEmail: coach.contactEmail,
      pricePerHour: coach.pricePerHour ?? null,
      imageUrl: coach.imageUrl ?? null,
    };

    const existingCoach = coach.id ? await prisma.coach.findUnique({
      where: { id: coach.id },
    }) : null;

    const savedCoach = existingCoach
      ? await prisma.coach.update({
          where: { id: coach.id },
          data,
        })
      : await prisma.coach.create({
          data: {
            ...data,
            id: coach.id || undefined,
          },
        });

    return {
      id: savedCoach.id,
      name: savedCoach.name,
      sport: savedCoach.sport as Coach['sport'],
      city: savedCoach.city,
      location: savedCoach.location ?? undefined,
      description: savedCoach.description,
      experience: savedCoach.experience,
      qualifications: JSON.parse(savedCoach.qualifications || '[]') as string[],
      contactName: savedCoach.contactName,
      contactPhone: savedCoach.contactPhone,
      contactEmail: savedCoach.contactEmail,
      pricePerHour: savedCoach.pricePerHour ?? undefined,
      imageUrl: savedCoach.imageUrl ?? undefined,
      createdAt: savedCoach.createdAt.toISOString(),
      updatedAt: savedCoach.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('Error saving coach:', error);
    throw error;
  }
}

export async function deleteCoach(id: string): Promise<boolean> {
  try {
    await prisma.coach.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error('Error deleting coach:', error);
    return false;
  }
}
