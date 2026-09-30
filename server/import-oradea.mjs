import dotenv from 'dotenv'
import mysql from 'mysql2/promise'
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const dir = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(dir, '.env') })

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL lipsește din server/.env')
  process.exit(1)
}

const rows = JSON.parse(readFileSync(path.join(dir, 'data', 'oradea-import.json'), 'utf8'))

function fold(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function sportsOf(value) {
  const seen = new Set()
  const sports = []
  for (const part of String(value || '').split('/')) {
    const sport = fold(part)
    if (!sport || seen.has(sport)) continue
    seen.add(sport)
    sports.push(sport)
  }
  return sports
}

function facilityType(row) {
  const place = fold(row['Categorie locatie'])
  if (place === 'antrenor') return 'coach'
  if (place.includes('magazin')) return 'equipment_shop'
  return 'field'
}

function text(value) {
  const cleaned = String(value || '').trim()
  return cleaned || null
}

const pool = mysql.createPool(process.env.DATABASE_URL)
let inserted = 0
let skipped = 0

try {
  for (const row of rows) {
    const name = text(row.Denumire)
    if (!name) continue
    const type = facilityType(row)
    const [existing] = await pool.query(
      'SELECT id FROM facilities WHERE city = ? AND name = ? AND facility_type = ? LIMIT 1',
      ['Oradea', name, type]
    )
    if (existing.length) {
      skipped += 1
      console.log(`skip ${name}`)
      continue
    }

    const sports = sportsOf(row['Categorie sport'])
    const address = text(row.Adresa)
    const description = text(row['Caracteristici speciale'])
    const phone = String(row['Numar telefon'] || '').replace(/\s/g, '').slice(0, 20)
    const email = text(row['e-mail'])
    const hasChangingRoom = description && fold(description).includes('vestiar') ? 1 : 0

    const [result] = await pool.query(
      `INSERT INTO facilities (
        facility_type, name, city, county, location, location_not_specified,
        phone, email, description, sport, has_changing_room, status, is_verified
      ) VALUES (?, ?, 'Oradea', 'Bihor', ?, ?, ?, ?, ?, ?, ?, 'active', 0)`,
      [
        type,
        name,
        address,
        address ? 0 : 1,
        phone,
        email ? email.toLowerCase() : null,
        description,
        sports[0] || null,
        hasChangingRoom
      ]
    )

    if (type === 'field') {
      for (const sport of sports) {
        await pool.query(
          'INSERT INTO facility_sports_fields (facility_id, sport_type) VALUES (?, ?)',
          [result.insertId, sport]
        )
      }
    }

    inserted += 1
    console.log(`add ${type} ${name} (${sports.join(', ') || 'fara sport'})`)
  }
} finally {
  await pool.end()
}

console.log(`Gata. Adăugate: ${inserted}. Deja existente: ${skipped}.`)
