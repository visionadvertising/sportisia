-- Creează tabelele pentru SportsField
CREATE TABLE IF NOT EXISTS "SportsField" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "contactName" TEXT NOT NULL,
  "contactPhone" TEXT NOT NULL,
  "contactEmail" TEXT NOT NULL,
  "amenities" TEXT NOT NULL DEFAULT '[]',
  "pricePerHour" REAL,
  "imageUrl" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Creează tabelele pentru Coach
CREATE TABLE IF NOT EXISTS "Coach" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "sport" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "location" TEXT,
  "description" TEXT NOT NULL DEFAULT '',
  "experience" TEXT NOT NULL DEFAULT '',
  "qualifications" TEXT NOT NULL DEFAULT '[]',
  "contactName" TEXT NOT NULL,
  "contactPhone" TEXT NOT NULL,
  "contactEmail" TEXT NOT NULL,
  "pricePerHour" REAL,
  "imageUrl" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Creează indexurile
CREATE INDEX IF NOT EXISTS "SportsField_type_idx" ON "SportsField"("type");
CREATE INDEX IF NOT EXISTS "SportsField_city_idx" ON "SportsField"("city");
CREATE INDEX IF NOT EXISTS "Coach_sport_idx" ON "Coach"("sport");
CREATE INDEX IF NOT EXISTS "Coach_city_idx" ON "Coach"("city");

