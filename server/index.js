import express from 'express'
import mysql from 'mysql2/promise'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import crypto from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app = express()
// Folosește PORT din environment sau 3001
const PORT = process.env.PORT || process.env.NODE_PORT || 3001

// CORS - permite requests de la același domeniu
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Database connection
let pool

async function initDatabase() {
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

    pool = mysql.createPool({
      host,
      port: parseInt(port),
      user: username,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    })

    // Test connection
    const connection = await pool.getConnection()
    console.log('✅ Database connected successfully')
    connection.release()

    // Create users table for facility accounts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        facility_id INT,
        facility_type ENUM('field', 'coach', 'repair_shop', 'equipment_shop') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_username (username),
        INDEX idx_facility (facility_id, facility_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Create facilities table (unified for all types)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS facilities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        facility_type ENUM('field', 'coach', 'repair_shop', 'equipment_shop') NOT NULL,
        name VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255),
        description TEXT,
        image_url VARCHAR(500),
        
        -- Fields specific
        sport VARCHAR(100),
        price_per_hour DECIMAL(10, 2),
        pricing_details JSON,
        has_parking BOOLEAN DEFAULT FALSE,
        has_shower BOOLEAN DEFAULT FALSE,
        has_changing_room BOOLEAN DEFAULT FALSE,
        has_air_conditioning BOOLEAN DEFAULT FALSE,
        has_lighting BOOLEAN DEFAULT FALSE,
        
        -- Coach specific
        specialization TEXT,
        experience_years INT,
        price_per_lesson DECIMAL(10, 2),
        certifications TEXT,
        languages VARCHAR(255),
        
        -- Repair shop specific
        services_offered TEXT,
        brands_serviced VARCHAR(500),
        average_repair_time VARCHAR(100),
        
        -- Equipment shop specific
        products_categories VARCHAR(500),
        brands_available VARCHAR(500),
        delivery_available BOOLEAN DEFAULT FALSE,
        
        -- Common fields
        logo_url VARCHAR(500),
        website VARCHAR(500),
        social_media JSON,
        gallery JSON,
        opening_hours VARCHAR(255),
        status ENUM('active', 'pending', 'inactive') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_type (facility_type),
        INDEX idx_city (city),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Create pending_cities table for new city submissions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pending_cities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        city VARCHAR(255) NOT NULL UNIQUE,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Create pending_sports table for new sport submissions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pending_sports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sport VARCHAR(100) NOT NULL UNIQUE,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Keep sports_fields for backward compatibility (will migrate later)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sports_fields (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        sport VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255),
        has_parking BOOLEAN DEFAULT FALSE,
        has_shower BOOLEAN DEFAULT FALSE,
        has_changing_room BOOLEAN DEFAULT FALSE,
        has_air_conditioning BOOLEAN DEFAULT FALSE,
        has_lighting BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    // Create admin users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_username (username)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Create site settings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_key (setting_key)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Create default admin user if it doesn't exist
    const [adminExists] = await pool.query('SELECT id FROM admin_users WHERE username = ?', ['admin'])
    if (adminExists.length === 0) {
      const defaultPassword = hashPassword('admin123') // Default password - CHANGE THIS!
      await pool.query(
        'INSERT INTO admin_users (username, password, email) VALUES (?, ?, ?)',
        ['admin', defaultPassword, 'admin@sportisia.ro']
      )
      console.log('✅ Default admin user created (username: admin, password: admin123 - CHANGE THIS!)')
    }

    // Initialize site settings
    const [logoExists] = await pool.query('SELECT id FROM site_settings WHERE setting_key = ?', ['site_logo'])
    if (logoExists.length === 0) {
      await pool.query(
        'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)',
        ['site_logo', '']
      )
    }

    console.log('✅ Tables created or already exist')

    // Check and add missing columns to facilities table
    await addMissingColumns()
  } catch (error) {
    console.error('❌ Database initialization error:', error)
    // Nu aruncă eroarea, lasă serverul să pornească chiar dacă DB nu funcționează
  }
}

async function addMissingColumns() {
  try {
    if (!pool) return

    // Check if columns exist and add them if missing
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'facilities'
    `)
    
    const existingColumns = columns.map((col) => col.COLUMN_NAME)
    
    // Add missing columns
    if (!existingColumns.includes('logo_url')) {
      await pool.query(`ALTER TABLE facilities ADD COLUMN logo_url VARCHAR(500) AFTER image_url`)
      console.log('✅ Added logo_url column')
    }
    
    if (!existingColumns.includes('social_media')) {
      await pool.query(`ALTER TABLE facilities ADD COLUMN social_media JSON AFTER logo_url`)
      console.log('✅ Added social_media column')
    }
    
    if (!existingColumns.includes('gallery')) {
      await pool.query(`ALTER TABLE facilities ADD COLUMN gallery JSON AFTER social_media`)
      console.log('✅ Added gallery column')
    }
    
    if (!existingColumns.includes('pricing_details')) {
      await pool.query(`ALTER TABLE facilities ADD COLUMN pricing_details JSON AFTER price_per_hour`)
      console.log('✅ Added pricing_details column')
    }
  } catch (error) {
    console.error('❌ Error adding missing columns:', error)
    // Don't throw, just log the error
  }
}

// Initialize database on startup
initDatabase().catch((error) => {
  console.error('❌ Failed to initialize database:', error)
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is running', 
    timestamp: new Date().toISOString(),
    port: PORT,
    env: process.env.NODE_ENV || 'development'
  })
})

// API Routes

// GET all fields
app.get('/api/fields', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }
    const [rows] = await pool.query('SELECT * FROM sports_fields ORDER BY created_at DESC')
    res.json({ success: true, data: rows })
  } catch (error) {
    console.error('Error fetching fields:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// POST new field
app.post('/api/fields', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }
    
    const {
      name, city, location, sport, price, description, imageUrl,
      phone, email, hasParking, hasShower, hasChangingRoom,
      hasAirConditioning, hasLighting
    } = req.body

    if (!name || !city || !location || !sport || !price || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Lipsește informație obligatorie'
      })
    }

    const [result] = await pool.query(
      `INSERT INTO sports_fields 
      (name, city, location, sport, price, description, image_url, phone, email, 
       has_parking, has_shower, has_changing_room, has_air_conditioning, has_lighting)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, city, location, sport, parseFloat(price),
        description || null, imageUrl || null, phone, email || null,
        hasParking || false, hasShower || false, hasChangingRoom || false,
        hasAirConditioning || false, hasLighting || false
      ]
    )

    res.json({
      success: true,
      message: 'Terenul a fost adăugat cu succes',
      id: result.insertId
    })
  } catch (error) {
    console.error('Error adding field:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET field by ID
app.get('/api/fields/:id', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }
    const [rows] = await pool.query('SELECT * FROM sports_fields WHERE id = ?', [req.params.id])
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Terenul nu a fost găsit' })
    }
    res.json({ success: true, data: rows[0] })
  } catch (error) {
    console.error('Error fetching field:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Helper function to hash password
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

// Helper function to generate username from facility name
function generateUsername(facilityName, facilityType) {
  const base = facilityName.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 15)
  const random = Math.floor(Math.random() * 1000)
  return `${base}${random}`
}

// POST register facility
app.post('/api/register', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    const {
      facilityType, // 'field', 'coach', 'repair_shop', 'equipment_shop'
      name, city, location, phone, email, description, imageUrl,
      // New common fields
      logoUrl, socialMedia, gallery,
      // Field specific
      sport, pricePerHour, pricingDetails, hasParking, hasShower, hasChangingRoom, hasAirConditioning, hasLighting,
      // Coach specific
      specialization, experienceYears, pricePerLesson, certifications, languages,
      // Repair shop specific
      servicesOffered, brandsServiced, averageRepairTime,
      // Equipment shop specific
      productsCategories, brandsAvailable, deliveryAvailable,
      // Common
      website, openingHours
    } = req.body

    // Validate required fields
    if (!facilityType || !name || !city || !location || !phone || !email) {
      return res.status(400).json({
        success: false,
        error: 'Lipsește informație obligatorie'
      })
    }

    // Validate facility type specific fields
    // For fields, check if sport is provided and if pricingDetails has at least one entry
    if (facilityType === 'field' && (!sport || (pricingDetails && pricingDetails.length === 0 && !pricePerHour))) {
      return res.status(400).json({
        success: false,
        error: 'Pentru terenuri, sport și cel puțin un preț sunt obligatorii'
      })
    }

    // For coaches, check specialization and pricing
    if (facilityType === 'coach' && (!specialization || (pricingDetails && pricingDetails.length === 0 && !pricePerLesson))) {
      return res.status(400).json({
        success: false,
        error: 'Pentru antrenori, specializare și cel puțin un preț sunt obligatorii'
      })
    }

    // Extract pricePerHour from pricingDetails if not provided directly
    if (facilityType === 'field' && !pricePerHour && pricingDetails && pricingDetails.length > 0) {
      pricePerHour = pricingDetails[0].price
    }

    // Extract pricePerLesson from pricingDetails if not provided directly
    if (facilityType === 'coach' && !pricePerLesson && pricingDetails && pricingDetails.length > 0) {
      pricePerLesson = pricingDetails[0].price
    }

    // Generate username and password
    const username = generateUsername(name, facilityType)
    const password = crypto.randomBytes(8).toString('hex') // Generate random password
    const hashedPassword = hashPassword(password)

    // Start transaction
    const connection = await pool.getConnection()
    await connection.beginTransaction()

    try {
      // Prepare values array
      const values = [
        facilityType, name, city, location, phone, email || null, description || null, imageUrl || null,
        logoUrl || null, 
        socialMedia ? JSON.stringify(socialMedia) : null,
        gallery ? JSON.stringify(gallery) : null,
        sport || null, pricePerHour ? parseFloat(pricePerHour) : null,
        pricingDetails ? JSON.stringify(pricingDetails) : null,
        hasParking || false, hasShower || false, hasChangingRoom || false,
        hasAirConditioning || false, hasLighting || false,
        specialization || null, experienceYears || null, pricePerLesson ? parseFloat(pricePerLesson) : null,
        certifications || null, languages || null,
        servicesOffered || null, brandsServiced || null, averageRepairTime || null,
        productsCategories || null, brandsAvailable || null, deliveryAvailable || false,
        website || null, openingHours || null,
        'pending' // status
      ]

      // Verify values count - MUST BE 33
      if (values.length !== 33) {
        const errorMsg = `Values array must have 33 elements, but has ${values.length}. Last value: ${values[values.length - 1]}`
        console.error(`[REGISTER ERROR] ${errorMsg}`)
        throw new Error(errorMsg)
      }

      // Debug: log values count
      console.log(`[REGISTER] Inserting facility: ${name}`)
      console.log(`[REGISTER] Values count: ${values.length}, expected: 33`)
      console.log(`[REGISTER] Last value (status): ${values[32]}`)

      // Insert facility
      const [facilityResult] = await connection.query(
        `INSERT INTO facilities (
          facility_type, name, city, location, phone, email, description, image_url,
          logo_url, social_media, gallery,
          sport, price_per_hour, pricing_details, has_parking, has_shower, has_changing_room, 
          has_air_conditioning, has_lighting,
          specialization, experience_years, price_per_lesson, certifications, languages,
          services_offered, brands_serviced, average_repair_time,
          products_categories, brands_available, delivery_available,
          website, opening_hours, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        values
      )

      const facilityId = facilityResult.insertId

      // Check if city is new (not in ROMANIAN_CITIES list) and add to pending_cities if needed
      if (city) {
        // Check if city exists in pending_cities
        const [existingCity] = await connection.query(
          'SELECT * FROM pending_cities WHERE city = ?',
          [city.trim()]
        )
        
        if (existingCity.length === 0) {
          // Check if it's a standard Romanian city (we'll assume it's new if not in our standard list)
          // For now, we'll add all cities to pending_cities, and they'll be approved when facility is approved
          await connection.query(
            'INSERT INTO pending_cities (city, status) VALUES (?, ?)',
            [city.trim(), 'pending']
          )
        }
      }

      // Check if sport is new and add to pending_sports if needed
      if (sport) {
        const sportLower = sport.trim().toLowerCase()
        // Check if sport exists in pending_sports
        const [existingSport] = await connection.query(
          'SELECT * FROM pending_sports WHERE sport = ?',
          [sportLower]
        )
        
        if (existingSport.length === 0) {
          // Add as pending
          await connection.query(
            'INSERT INTO pending_sports (sport, status) VALUES (?, ?)',
            [sportLower, 'pending']
          )
        }
      }

      // Create user account
      await connection.query(
        `INSERT INTO users (username, password, email, facility_id, facility_type)
         VALUES (?, ?, ?, ?, ?)`,
        [username, hashedPassword, email, facilityId, facilityType]
      )

      await connection.commit()
      connection.release()

      res.json({
        success: true,
        message: 'Facilitatea a fost înregistrată cu succes',
        credentials: {
          username,
          password,
          facilityId,
          facilityType
        }
      })
    } catch (error) {
      await connection.rollback()
      connection.release()
      throw error
    }
  } catch (error) {
    console.error('Error registering facility:', error)
    console.error('Error stack:', error.stack)
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
})

// POST login
app.post('/api/login', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username și parolă sunt obligatorii'
      })
    }

    const hashedPassword = hashPassword(password)
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.email, u.facility_id, u.facility_type, f.*
       FROM users u
       LEFT JOIN facilities f ON u.facility_id = f.id AND u.facility_type = f.facility_type
       WHERE u.username = ? AND u.password = ?`,
      [username, hashedPassword]
    )

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Credențiale invalide'
      })
    }

    const user = rows[0]
    // Don't send password hash
    delete user.password

    res.json({
      success: true,
      message: 'Autentificare reușită',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        facilityId: user.facility_id,
        facilityType: user.facility_type,
        facility: user.facility_id ? {
          id: user.id,
          name: user.name,
          city: user.city,
          location: user.location,
          phone: user.phone,
          email: user.email,
          status: user.status
        } : null
      }
    })
  } catch (error) {
    console.error('Error during login:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET facility by user (for dashboard)
app.get('/api/my-facility', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    const { username } = req.query
    if (!username) {
      return res.status(400).json({
        success: false,
        error: 'Username este obligatoriu'
      })
    }

    const [rows] = await pool.query(
      `SELECT f.*, u.username, u.email as user_email
       FROM facilities f
       INNER JOIN users u ON f.id = u.facility_id AND f.facility_type = u.facility_type
       WHERE u.username = ?`,
      [username]
    )

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Facilitatea nu a fost găsită'
      })
    }

    res.json({ success: true, data: rows[0] })
  } catch (error) {
    console.error('Error fetching facility:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// PUT update facility
app.put('/api/facilities/:id', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    const facilityId = req.params.id
    const {
      name, city, location, phone, email, description, imageUrl,
      logoUrl, socialMedia, gallery,
      sport, pricePerHour, pricingDetails, hasParking, hasShower, hasChangingRoom, hasAirConditioning, hasLighting,
      specialization, experienceYears, pricePerLesson, certifications, languages,
      servicesOffered, brandsServiced, averageRepairTime,
      productsCategories, brandsAvailable, deliveryAvailable,
      website, openingHours, status
    } = req.body

    // Build update query dynamically based on facility type
    const updates = []
    const values = []

    if (name) { updates.push('name = ?'); values.push(name) }
    if (city) { updates.push('city = ?'); values.push(city) }
    if (location) { updates.push('location = ?'); values.push(location) }
    if (phone) { updates.push('phone = ?'); values.push(phone) }
    if (email !== undefined) { updates.push('email = ?'); values.push(email) }
    if (description !== undefined) { updates.push('description = ?'); values.push(description) }
    if (imageUrl !== undefined) { updates.push('image_url = ?'); values.push(imageUrl) }
    if (logoUrl !== undefined) { updates.push('logo_url = ?'); values.push(logoUrl) }
    if (socialMedia !== undefined) { updates.push('social_media = ?'); values.push(JSON.stringify(socialMedia)) }
    if (gallery !== undefined) { updates.push('gallery = ?'); values.push(JSON.stringify(gallery)) }
    if (website !== undefined) { updates.push('website = ?'); values.push(website) }
    if (openingHours !== undefined) { updates.push('opening_hours = ?'); values.push(openingHours) }
    if (status) { updates.push('status = ?'); values.push(status) }

    // Field specific
    if (sport !== undefined) { updates.push('sport = ?'); values.push(sport) }
    if (pricePerHour !== undefined) { updates.push('price_per_hour = ?'); values.push(parseFloat(pricePerHour)) }
    if (pricingDetails !== undefined) { updates.push('pricing_details = ?'); values.push(JSON.stringify(pricingDetails)) }
    if (hasParking !== undefined) { updates.push('has_parking = ?'); values.push(hasParking) }
    if (hasShower !== undefined) { updates.push('has_shower = ?'); values.push(hasShower) }
    if (hasChangingRoom !== undefined) { updates.push('has_changing_room = ?'); values.push(hasChangingRoom) }
    if (hasAirConditioning !== undefined) { updates.push('has_air_conditioning = ?'); values.push(hasAirConditioning) }
    if (hasLighting !== undefined) { updates.push('has_lighting = ?'); values.push(hasLighting) }

    // Coach specific
    if (specialization !== undefined) { updates.push('specialization = ?'); values.push(specialization) }
    if (experienceYears !== undefined) { updates.push('experience_years = ?'); values.push(experienceYears) }
    if (pricePerLesson !== undefined) { updates.push('price_per_lesson = ?'); values.push(parseFloat(pricePerLesson)) }
    if (certifications !== undefined) { updates.push('certifications = ?'); values.push(certifications) }
    if (languages !== undefined) { updates.push('languages = ?'); values.push(languages) }

    // Repair shop specific
    if (servicesOffered !== undefined) { updates.push('services_offered = ?'); values.push(servicesOffered) }
    if (brandsServiced !== undefined) { updates.push('brands_serviced = ?'); values.push(brandsServiced) }
    if (averageRepairTime !== undefined) { updates.push('average_repair_time = ?'); values.push(averageRepairTime) }

    // Equipment shop specific
    if (productsCategories !== undefined) { updates.push('products_categories = ?'); values.push(productsCategories) }
    if (brandsAvailable !== undefined) { updates.push('brands_available = ?'); values.push(brandsAvailable) }
    if (deliveryAvailable !== undefined) { updates.push('delivery_available = ?'); values.push(deliveryAvailable) }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nu există câmpuri de actualizat'
      })
    }

    values.push(facilityId)

    await pool.query(
      `UPDATE facilities SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    )

    res.json({
      success: true,
      message: 'Facilitatea a fost actualizată cu succes'
    })
  } catch (error) {
    console.error('Error updating facility:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// ==================== PUBLIC ENDPOINTS ====================

// GET all sports with facility counts (including approved sports from pending_sports)
app.get('/api/sports', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    // Get sports from active facilities
    const [facilitySports] = await pool.query(`
      SELECT 
        sport,
        COUNT(*) as facility_count
      FROM facilities
      WHERE sport IS NOT NULL AND sport != '' AND status = 'active'
      GROUP BY sport
    `)

    // Get approved sports from pending_sports
    const [approvedSports] = await pool.query(`
      SELECT sport, 0 as facility_count
      FROM pending_sports
      WHERE status = 'approved'
    `)

    // Combine and deduplicate
    const sportMap = new Map()
    
    facilitySports.forEach((row) => {
      sportMap.set(row.sport, row.facility_count)
    })
    
    approvedSports.forEach((row) => {
      if (!sportMap.has(row.sport)) {
        sportMap.set(row.sport, 0)
      }
    })

    // Convert to array and sort
    const sports = Array.from(sportMap.entries()).map(([sport, count]) => ({
      sport,
      facility_count: count
    })).sort((a, b) => {
      if (b.facility_count !== a.facility_count) {
        return b.facility_count - a.facility_count
      }
      return a.sport.localeCompare(b.sport)
    })

    res.json({ success: true, data: sports })
  } catch (error) {
    console.error('Error fetching sports:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET all cities with facility counts (including approved cities from pending_cities)
app.get('/api/cities', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    // Get cities from active facilities
    const [facilityCities] = await pool.query(`
      SELECT 
        city,
        COUNT(*) as facility_count
      FROM facilities
      WHERE city IS NOT NULL AND city != '' AND status = 'active'
      GROUP BY city
    `)

    // Get approved cities from pending_cities
    const [approvedCities] = await pool.query(`
      SELECT city, 0 as facility_count
      FROM pending_cities
      WHERE status = 'approved'
    `)

    // Combine and deduplicate
    const cityMap = new Map()
    
    facilityCities.forEach((row) => {
      cityMap.set(row.city, row.facility_count)
    })
    
    approvedCities.forEach((row) => {
      if (!cityMap.has(row.city)) {
        cityMap.set(row.city, 0)
      }
    })

    // Convert to array and sort
    const cities = Array.from(cityMap.entries()).map(([city, count]) => ({
      city,
      facility_count: count
    })).sort((a, b) => {
      if (b.facility_count !== a.facility_count) {
        return b.facility_count - a.facility_count
      }
      return a.city.localeCompare(b.city)
    })

    res.json({ success: true, data: cities })
  } catch (error) {
    console.error('Error fetching cities:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET single facility by ID
app.get('/api/facilities/:id', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    const facilityId = req.params.id
    const [rows] = await pool.query('SELECT * FROM facilities WHERE id = ?', [facilityId])

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Facilitatea nu a fost găsită' })
    }

    res.json({ success: true, data: rows[0] })
  } catch (error) {
    console.error('Error fetching facility:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET facilities filtered by type, city, sport
app.get('/api/facilities', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    const { type, city, sport, status = 'active' } = req.query

    let query = 'SELECT * FROM facilities WHERE 1=1'
    const params = []

    if (type) {
      query += ' AND facility_type = ?'
      params.push(type)
    }

    if (city) {
      query += ' AND city = ?'
      params.push(city)
    }

    if (sport) {
      query += ' AND sport = ?'
      params.push(sport)
    }

    if (status) {
      query += ' AND status = ?'
      params.push(status)
    }

    query += ' ORDER BY created_at DESC'

    console.log('[API /facilities] Query:', query)
    console.log('[API /facilities] Params:', params)
    
    const [rows] = await pool.query(query, params)
    
    console.log('[API /facilities] Results count:', rows.length)
    if (rows.length > 0) {
      console.log('[API /facilities] First result facility_type:', rows[0].facility_type)
    }

    res.json({ success: true, data: rows })
  } catch (error) {
    console.error('Error fetching facilities:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// ==================== ADMIN ENDPOINTS ====================

// POST admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username și parolă sunt obligatorii'
      })
    }

    const hashedPassword = hashPassword(password)
    const [rows] = await pool.query(
      'SELECT id, username, email FROM admin_users WHERE username = ? AND password = ?',
      [username, hashedPassword]
    )

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Credențiale invalide'
      })
    }

    res.json({
      success: true,
      message: 'Autentificare reușită',
      admin: {
        id: rows[0].id,
        username: rows[0].username,
        email: rows[0].email
      }
    })
  } catch (error) {
    console.error('Error during admin login:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET pending facilities (for approval)
app.get('/api/admin/pending-facilities', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    const [rows] = await pool.query(
      `SELECT f.*, u.username, u.email as user_email
       FROM facilities f
       LEFT JOIN users u ON f.id = u.facility_id AND f.facility_type = u.facility_type
       WHERE f.status = 'pending'
       ORDER BY f.created_at DESC`
    )

    res.json({ success: true, data: rows })
  } catch (error) {
    console.error('Error fetching pending facilities:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// PUT approve/reject facility
app.put('/api/admin/facilities/:id/status', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    const facilityId = req.params.id
    const { status } = req.body // 'active' or 'inactive'

    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status invalid. Trebuie să fie "active" sau "inactive"'
      })
    }

    // Get facility details before updating
    const [facilities] = await pool.query(
      'SELECT city, sport FROM facilities WHERE id = ?',
      [facilityId]
    )

    if (facilities.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Facilitatea nu a fost găsită'
      })
    }

    const facility = facilities[0]

    // Update facility status
    await pool.query(
      'UPDATE facilities SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, facilityId]
    )

    // If approving facility, also approve city and sport if they are new
    if (status === 'active') {
      // Check if city is new (not in standard list)
      // We'll check if it exists in pending_cities
      if (facility.city) {
        const [pendingCity] = await pool.query(
          'SELECT * FROM pending_cities WHERE city = ? AND status = ?',
          [facility.city, 'pending']
        )
        
        if (pendingCity.length > 0) {
          // Approve the city automatically
          await pool.query(
            'UPDATE pending_cities SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE city = ?',
            ['approved', facility.city]
          )
        } else {
          // If not in pending, check if it's a new city and add it as approved
          const [existingCity] = await pool.query(
            'SELECT * FROM pending_cities WHERE city = ?',
            [facility.city]
          )
          
          if (existingCity.length === 0) {
            // Add as approved directly
            await pool.query(
              'INSERT INTO pending_cities (city, status) VALUES (?, ?)',
              [facility.city, 'approved']
            )
          }
        }
      }

      // Check if sport is new (not in standard list)
      if (facility.sport) {
        const [pendingSport] = await pool.query(
          'SELECT * FROM pending_sports WHERE sport = ? AND status = ?',
          [facility.sport.toLowerCase(), 'pending']
        )
        
        if (pendingSport.length > 0) {
          // Approve the sport automatically
          await pool.query(
            'UPDATE pending_sports SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE sport = ?',
            ['approved', facility.sport.toLowerCase()]
          )
        } else {
          // If not in pending, check if it's a new sport and add it as approved
          const [existingSport] = await pool.query(
            'SELECT * FROM pending_sports WHERE sport = ?',
            [facility.sport.toLowerCase()]
          )
          
          if (existingSport.length === 0) {
            // Add as approved directly
            await pool.query(
              'INSERT INTO pending_sports (sport, status) VALUES (?, ?)',
              [facility.sport.toLowerCase(), 'approved']
            )
          }
        }
      }
    }

    res.json({
      success: true,
      message: `Facilitatea a fost ${status === 'active' ? 'aprobată' : 'respinsă'} cu succes`
    })
  } catch (error) {
    console.error('Error updating facility status:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET all users
app.get('/api/admin/users', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.email, u.facility_id, u.facility_type, u.created_at,
              f.name as facility_name, f.status as facility_status
       FROM users u
       LEFT JOIN facilities f ON u.facility_id = f.id AND u.facility_type = f.facility_type
       ORDER BY u.created_at DESC`
    )

    res.json({ success: true, data: rows })
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// POST reset user password
app.post('/api/admin/users/:id/reset-password', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    const userId = req.params.id
    const newPassword = crypto.randomBytes(8).toString('hex') // Generate random password
    const hashedPassword = hashPassword(newPassword)

    await pool.query(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, userId]
    )

    res.json({
      success: true,
      message: 'Parola a fost resetată cu succes',
      newPassword: newPassword
    })
  } catch (error) {
    console.error('Error resetting password:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET site settings
app.get('/api/admin/site-settings', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    const [rows] = await pool.query('SELECT setting_key, setting_value FROM site_settings')
    
    const settings = {}
    rows.forEach(row => {
      settings[row.setting_key] = row.setting_value
    })

    res.json({ success: true, data: settings })
  } catch (error) {
    console.error('Error fetching site settings:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// PUT update site logo
app.put('/api/admin/site-settings/logo', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    const { logoUrl } = req.body

    if (!logoUrl) {
      return res.status(400).json({
        success: false,
        error: 'URL-ul logo-ului este obligatoriu'
      })
    }

    await pool.query(
      `INSERT INTO site_settings (setting_key, setting_value) 
       VALUES ('site_logo', ?) 
       ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = CURRENT_TIMESTAMP`,
      [logoUrl, logoUrl]
    )

    res.json({
      success: true,
      message: 'Logo-ul site-ului a fost actualizat cu succes'
    })
  } catch (error) {
    console.error('Error updating site logo:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ success: false, error: 'Internal server error' })
})

// Start server
// POST submit new city for approval
app.post('/api/pending-cities', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    const { city } = req.body

    if (!city || !city.trim()) {
      return res.status(400).json({ success: false, error: 'Orașul este obligatoriu' })
    }

    // Check if city already exists (pending or approved)
    const [existing] = await pool.query(
      'SELECT * FROM pending_cities WHERE city = ?',
      [city.trim()]
    )

    if (existing.length > 0) {
      return res.json({
        success: true,
        message: 'Orașul a fost deja trimis pentru aprobare',
        data: existing[0]
      })
    }

    // Insert new pending city
    const [result] = await pool.query(
      'INSERT INTO pending_cities (city, status) VALUES (?, ?)',
      [city.trim(), 'pending']
    )

    res.json({
      success: true,
      message: 'Orașul a fost trimis pentru aprobare',
      data: { id: result.insertId, city: city.trim(), status: 'pending' }
    })
  } catch (error) {
    console.error('Error submitting pending city:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// POST submit new sport for approval
app.post('/api/pending-sports', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    const { sport } = req.body

    if (!sport || !sport.trim()) {
      return res.status(400).json({ success: false, error: 'Sportul este obligatoriu' })
    }

    // Check if sport already exists (pending or approved)
    const [existing] = await pool.query(
      'SELECT * FROM pending_sports WHERE sport = ?',
      [sport.trim().toLowerCase()]
    )

    if (existing.length > 0) {
      return res.json({
        success: true,
        message: 'Sportul a fost deja trimis pentru aprobare',
        data: existing[0]
      })
    }

    // Insert new pending sport
    const [result] = await pool.query(
      'INSERT INTO pending_sports (sport, status) VALUES (?, ?)',
      [sport.trim().toLowerCase(), 'pending']
    )

    res.json({
      success: true,
      message: 'Sportul a fost trimis pentru aprobare',
      data: { id: result.insertId, sport: sport.trim().toLowerCase(), status: 'pending' }
    })
  } catch (error) {
    console.error('Error submitting pending sport:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET pending cities (admin only)
app.get('/api/admin/pending-cities', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    const [rows] = await pool.query(
      'SELECT * FROM pending_cities WHERE status = ? ORDER BY created_at DESC',
      ['pending']
    )

    res.json({ success: true, data: rows })
  } catch (error) {
    console.error('Error fetching pending cities:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET pending sports (admin only)
app.get('/api/admin/pending-sports', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    const [rows] = await pool.query(
      'SELECT * FROM pending_sports WHERE status = ? ORDER BY created_at DESC',
      ['pending']
    )

    res.json({ success: true, data: rows })
  } catch (error) {
    console.error('Error fetching pending sports:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// PUT approve/reject pending city
app.put('/api/admin/pending-cities/:id/status', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    const cityId = req.params.id
    const { status } = req.body // 'approved' or 'rejected'

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status invalid. Trebuie să fie "approved" sau "rejected"'
      })
    }

    await pool.query(
      'UPDATE pending_cities SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, cityId]
    )

    res.json({
      success: true,
      message: `Orașul a fost ${status === 'approved' ? 'aprobat' : 'respins'} cu succes`
    })
  } catch (error) {
    console.error('Error updating pending city status:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// PUT approve/reject pending sport
app.put('/api/admin/pending-sports/:id/status', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    const sportId = req.params.id
    const { status } = req.body // 'approved' or 'rejected'

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status invalid. Trebuie să fie "approved" sau "rejected"'
      })
    }

    await pool.query(
      'UPDATE pending_sports SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, sportId]
    )

    res.json({
      success: true,
      message: `Sportul a fost ${status === 'approved' ? 'aprobat' : 'respins'} cu succes`
    })
  } catch (error) {
    console.error('Error updating pending sport status:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📡 API available at http://localhost:${PORT}/api`)
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...')
  if (pool) {
    pool.end()
  }
  process.exit(0)
})
