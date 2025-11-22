// Script manual pentru a adăuga coloanele lipsă
// Rulează: node server/migrate-columns.js

import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

async function migrateColumns() {
  try {
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
      throw new Error('DATABASE_URL environment variable is required')
    }
    
    // Parse DATABASE_URL
    const url = new URL(dbUrl.replace('mysql://', 'http://'))
    const username = url.username
    const password = url.password
    const host = url.hostname
    const port = url.port || 3306
    const database = url.pathname.slice(1)

    const connection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user: username,
      password,
      database
    })

    console.log('✅ Connected to database')

    // Check if columns exist
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'facilities'
    `, [database])
    
    const existingColumns = columns.map((col) => col.COLUMN_NAME)
    console.log('Existing columns:', existingColumns)
    
    // Add missing columns
    if (!existingColumns.includes('logo_url')) {
      await connection.query(`ALTER TABLE facilities ADD COLUMN logo_url VARCHAR(500) AFTER image_url`)
      console.log('✅ Added logo_url column')
    } else {
      console.log('⏭️  logo_url column already exists')
    }
    
    if (!existingColumns.includes('social_media')) {
      await connection.query(`ALTER TABLE facilities ADD COLUMN social_media JSON AFTER logo_url`)
      console.log('✅ Added social_media column')
    } else {
      console.log('⏭️  social_media column already exists')
    }
    
    if (!existingColumns.includes('gallery')) {
      await connection.query(`ALTER TABLE facilities ADD COLUMN gallery JSON AFTER social_media`)
      console.log('✅ Added gallery column')
    } else {
      console.log('⏭️  gallery column already exists')
    }
    
    if (!existingColumns.includes('pricing_details')) {
      await connection.query(`ALTER TABLE facilities ADD COLUMN pricing_details JSON AFTER price_per_hour`)
      console.log('✅ Added pricing_details column')
    } else {
      console.log('⏭️  pricing_details column already exists')
    }

    await connection.end()
    console.log('✅ Migration completed')
  } catch (error) {
    console.error('❌ Migration error:', error)
    process.exit(1)
  }
}

migrateColumns()

