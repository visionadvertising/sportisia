import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Validează DATABASE_URL
    const { ensureDatabaseInitialized } = await import('@/lib/prisma');
    try {
      await ensureDatabaseInitialized();
    } catch (initError: any) {
      if (initError.message?.includes('SQLite') || 
          initError.message?.includes('must start with "mysql://"') ||
          initError.message?.includes('DATABASE_URL environment variable is not set')) {
        return NextResponse.json(
          {
            success: false,
            message: 'DATABASE_URL nu este configurat corect pentru MySQL.',
            error: initError.message
          },
          { status: 500 }
        );
      }
      throw initError;
    }

    // Încearcă să creeze tabelele folosind Prisma db push programatic
    // Folosim $executeRawUnsafe pentru a executa SQL direct
    try {
      // Creează tabelele manual folosind SQL
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
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS \`SportsField_type_idx\` ON \`SportsField\`(\`type\`);
      `);

      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS \`SportsField_city_idx\` ON \`SportsField\`(\`city\`);
      `);

      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS \`Coach_sport_idx\` ON \`Coach\`(\`sport\`);
      `);

      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS \`Coach_city_idx\` ON \`Coach\`(\`city\`);
      `);

      return NextResponse.json({
        success: true,
        message: 'Tabelele au fost create cu succes în baza de date MySQL!',
        tablesCreated: ['SportsField', 'Coach']
      });
    } catch (sqlError: any) {
      // Dacă tabelele există deja, verifică dacă sunt corecte
      if (sqlError.message?.includes('already exists') || sqlError.code === 'ER_TABLE_EXISTS_ERROR') {
        return NextResponse.json({
          success: true,
          message: 'Tabelele există deja în baza de date.',
          tablesExist: true
        });
      }
      throw sqlError;
    }
  } catch (error: any) {
    console.error('Error creating tables:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Eroare la crearea tabelelor: ' + error.message,
        error: error.message
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}

