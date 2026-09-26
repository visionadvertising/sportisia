import express from 'express'
import mysql from 'mysql2/promise'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { existsSync, readFileSync, mkdirSync, writeFileSync, appendFileSync } from 'fs'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import multer from 'multer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env file from server directory
const envPath = path.join(__dirname, '.env')
if (existsSync(envPath)) {
  // First try dotenv
  dotenv.config({ path: envPath })
  
  // If DATABASE_URL is still not set, read .env manually
  if (!process.env.DATABASE_URL) {
    console.log('📖 Reading .env file manually...')
    const envContent = readFileSync(envPath, 'utf-8')
    const envLines = envContent.split('\n')
    envLines.forEach(line => {
      const trimmedLine = line.trim()
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=')
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim()
          // Remove quotes if present
          const cleanValue = value.replace(/^["']|["']$/g, '')
          process.env[key.trim()] = cleanValue
        }
      }
    })
    console.log('✅ Loaded environment variables manually from:', envPath)
  } else {
    console.log('✅ Loaded .env using dotenv from:', envPath)
  }
} else {
  console.warn('⚠️  .env file not found at:', envPath)
  // Try to load from default location
  dotenv.config()
}

const app = express()
// Folosește PORT din environment sau 3001
const PORT = process.env.PORT || process.env.NODE_PORT || 3001

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
    return callback(null, false)
  },
  credentials: true
}))

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  next()
})

app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true, limit: '2mb' }))

function loadAuthSecret() {
  if (process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 32) return process.env.AUTH_SECRET
  const secret = crypto.randomBytes(32).toString('hex')
  appendFileSync(envPath, `\nAUTH_SECRET=${secret}\n`)
  process.env.AUTH_SECRET = secret
  console.log('✅ AUTH_SECRET was created in server/.env')
  return secret
}

const AUTH_SECRET = loadAuthSecret()
const rateBuckets = new Map()

function clientIp(req) {
  return req.socket?.remoteAddress || 'unknown'
}

function rateLimit(req, res, bucket, limit, windowMs) {
  const now = Date.now()
  const key = `${bucket}:${clientIp(req)}`
  const recent = (rateBuckets.get(key) || []).filter((stamp) => now - stamp < windowMs)
  if (recent.length >= limit) {
    res.status(429).json({ success: false, error: 'Prea multe cereri. Încearcă din nou mai târziu.' })
    return false
  }
  recent.push(now)
  rateBuckets.set(key, recent)
  return true
}

function signToken(payload, ttlSeconds) {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + ttlSeconds * 1000 })).toString('base64url')
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(body).digest('base64url')
  return `${body}.${signature}`
}

function verifyToken(token, role) {
  if (!token || !token.includes('.')) return null
  const [body, signature] = token.split('.')
  const expected = crypto.createHmac('sha256', AUTH_SECRET).update(body).digest('base64url')
  const left = Buffer.from(signature)
  const right = Buffer.from(expected)
  if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) return null
  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString())
    if (!data.exp || data.exp < Date.now()) return null
    if (role && data.role !== role) return null
    return data
  } catch {
    return null
  }
}

function bearerToken(req) {
  const header = req.headers.authorization || ''
  return header.startsWith('Bearer ') ? header.slice(7).trim() : ''
}

function requireAdmin(req, res, next) {
  const session = verifyToken(bearerToken(req), 'admin')
  if (!session) {
    res.status(401).json({ success: false, error: 'Neautorizat' })
    return
  }
  req.admin = session
  next()
}

function requireUser(req, res) {
  const session = verifyToken(bearerToken(req), 'user')
  if (!session) {
    res.status(401).json({ success: false, error: 'Neautorizat' })
    return null
  }
  return session
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads')
    const logoDir = path.join(uploadDir, 'logos')
    const galleryDir = path.join(uploadDir, 'gallery')
    const blogDir = path.join(uploadDir, 'blog')
    
    // Create directories if they don't exist
    if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true })
    if (!existsSync(logoDir)) mkdirSync(logoDir, { recursive: true })
    if (!existsSync(galleryDir)) mkdirSync(galleryDir, { recursive: true })
    if (!existsSync(blogDir)) mkdirSync(blogDir, { recursive: true })
    
    // Determine destination based on field name
    if (file.fieldname === 'logo') {
      cb(null, logoDir)
    } else if (file.fieldname === 'gallery') {
      cb(null, galleryDir)
    } else if (file.fieldname === 'image' || file.fieldname === 'cover') {
      cb(null, blogDir)
    } else {
      cb(null, uploadDir)
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomhash.extension
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(8).toString('hex')
    const ext = path.extname(file.originalname) || '.jpg'
    cb(null, uniqueSuffix + ext)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file (already optimized on frontend)
    fieldSize: 10 * 1024 * 1024, // 10MB for other form fields (JSON strings, etc.)
    fields: 50, // Maximum number of non-file fields
    fieldNameSize: 100, // Maximum field name size
    files: 11 // Maximum number of files (1 logo + 10 gallery)
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})

// Initialize uploads directory on startup
const uploadsDir = path.join(__dirname, 'uploads')
const logosDir = path.join(uploadsDir, 'logos')
const galleryDir = path.join(uploadsDir, 'gallery')

if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true })
  console.log('✅ Created uploads directory')
}
if (!existsSync(logosDir)) {
  mkdirSync(logosDir, { recursive: true })
  console.log('✅ Created uploads/logos directory')
}
if (!existsSync(galleryDir)) {
  mkdirSync(galleryDir, { recursive: true })
  console.log('✅ Created uploads/gallery directory')
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir))

// Database connection
let pool

async function initDatabase() {
  try {
    console.log('🔄 Initializing database...')
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
      throw new Error('DATABASE_URL environment variable is required')
    }
    
    console.log('📋 DATABASE_URL format check:', dbUrl.substring(0, 20) + '...')
    
    // Parse DATABASE_URL
    const url = new URL(dbUrl.replace('mysql://', 'http://'))
    const username = url.username
    const password = url.password ? '***' : 'missing'
    const host = url.hostname
    const port = url.port || 3306
    const database = url.pathname.slice(1)

    console.log(`🔌 Connecting to database: ${host}:${port}/${database} (user: ${username}, password: ${password})`)

    pool = mysql.createPool({
      host,
      port: parseInt(port),
      user: username,
      password: url.password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    })

    // Test connection
    console.log('🧪 Testing database connection...')
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
        location VARCHAR(255),
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
        repair_categories JSON,
        
        -- Equipment shop specific
        products_categories VARCHAR(500),
        brands_available VARCHAR(500),
        delivery_available BOOLEAN DEFAULT FALSE,
        -- Note: sport column above is used for both fields and equipment shops
        -- For equipment shops, sport can be 'general' or a specific sport
        
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
        county VARCHAR(100),
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

    // Create facility_sports_fields table for multiple fields per sports base
    await pool.query(`
      CREATE TABLE IF NOT EXISTS facility_sports_fields (
        id INT AUTO_INCREMENT PRIMARY KEY,
        facility_id INT NOT NULL,
        sport_type VARCHAR(100) NOT NULL,
        field_name VARCHAR(255),
        price_per_hour DECIMAL(10, 2),
        description TEXT,
        features JSON,
        slot_size INT DEFAULT 60 COMMENT 'Slot size in minutes (30, 60, 90, 120)',
        time_slots JSON COMMENT 'Array of time slots: [{day, startTime, endTime, status, price}]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE,
        INDEX idx_facility_id (facility_id),
        INDEX idx_sport_type (sport_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Add new columns to facility_sports_fields if they don't exist (migration)
    try {
      const [fieldColumns] = await pool.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'facility_sports_fields' 
        AND TABLE_SCHEMA = DATABASE()
      `)
      const existingFieldColumns = fieldColumns.map((col) => col.COLUMN_NAME)

      if (!existingFieldColumns.includes('slot_size')) {
        await pool.query(`ALTER TABLE facility_sports_fields ADD COLUMN slot_size INT DEFAULT 60 COMMENT 'Slot size in minutes (30, 60, 90)'`)
        console.log('✅ Added slot_size column to facility_sports_fields')
      }

      if (!existingFieldColumns.includes('time_slots')) {
        await pool.query(`ALTER TABLE facility_sports_fields ADD COLUMN time_slots JSON COMMENT 'Array of time slots: [{day, startTime, endTime, status, price}]'`)
        console.log('✅ Added time_slots column to facility_sports_fields')
      }
      
      // Migrate old price_intervals and opening_hours to time_slots if they exist
      if (existingFieldColumns.includes('price_intervals') || existingFieldColumns.includes('opening_hours')) {
        console.log('⚠️ Old columns detected, migration needed (manual step required)')
      }
    } catch (error) {
      console.error('Error adding columns to facility_sports_fields:', error)
    }

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

    // Create SEO pages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS seo_pages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        url VARCHAR(500) NOT NULL UNIQUE,
        meta_title VARCHAR(255),
        meta_description TEXT,
        h1_title VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_url (url)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS blog_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        parent_id INT NULL,
        description TEXT,
        meta_title VARCHAR(255),
        meta_description TEXT,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_parent (parent_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT NULL,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        excerpt TEXT,
        content LONGTEXT,
        cover_image VARCHAR(500),
        status ENUM('draft', 'published') DEFAULT 'draft',
        published_at DATETIME NULL,
        author_name VARCHAR(255),
        tags JSON,
        meta_title VARCHAR(255),
        meta_description TEXT,
        canonical_url VARCHAR(500),
        og_image VARCHAR(500),
        robots VARCHAR(50) DEFAULT 'index,follow',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_category (category_id),
        INDEX idx_published (published_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS blog_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        author_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        rating TINYINT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_post (post_id),
        INDEX idx_status (status),
        FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    try {
      await pool.query('ALTER TABLE blog_comments ADD COLUMN parent_id INT NULL')
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') throw error
    }
    try {
      await pool.query('ALTER TABLE blog_comments ADD INDEX idx_comment_parent (parent_id)')
    } catch (error) {
      if (error.code !== 'ER_DUP_KEYNAME') throw error
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(180) NOT NULL,
        subject VARCHAR(180) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Create facility suggestions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS facility_suggestions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        county VARCHAR(100) NOT NULL,
        city VARCHAR(100) NOT NULL,
        address TEXT NOT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    const weakAdminHash = hashPassword('admin123')
    const [adminExists] = await pool.query('SELECT id, password FROM admin_users WHERE username = ?', ['admin'])
    if (adminExists.length === 0 || adminExists[0].password === weakAdminHash) {
      let password = process.env.ADMIN_PASSWORD
      if (!password || password === 'admin123') {
        password = crypto.randomBytes(18).toString('base64url')
        appendFileSync(envPath, `\nADMIN_PASSWORD=${password}\n`)
        process.env.ADMIN_PASSWORD = password
      }
      const hashed = hashPassword(password)
      if (adminExists.length === 0) {
        await pool.query(
          'INSERT INTO admin_users (username, password, email) VALUES (?, ?, ?)',
          ['admin', hashed, 'admin@sportisia.ro']
        )
        console.log('✅ Admin user created. Password saved in server/.env as ADMIN_PASSWORD')
      } else {
        await pool.query('UPDATE admin_users SET password = ? WHERE id = ?', [hashed, adminExists[0].id])
        console.log('⚠️ Default admin password replaced. New password is in server/.env as ADMIN_PASSWORD')
      }
    }

    // Initialize site settings
    const [logoExists] = await pool.query('SELECT id FROM site_settings WHERE setting_key = ?', ['site_logo'])
    if (logoExists.length === 0) {
      await pool.query(
        'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)',
        ['site_logo', '']
      )
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS facility_claims (
        id INT AUTO_INCREMENT PRIMARY KEY,
        facility_id INT NOT NULL,
        owner_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(30) NOT NULL,
        username VARCHAR(100) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        status ENUM('awaiting_payment', 'paid', 'completed') NOT NULL DEFAULT 'awaiting_payment',
        plan_code VARCHAR(50) NOT NULL DEFAULT 'owner_monthly',
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'RON',
        payment_provider VARCHAR(50) NOT NULL DEFAULT 'netopia',
        payment_status ENUM('pending', 'simulated', 'paid') NOT NULL DEFAULT 'pending',
        payment_reference VARCHAR(100),
        user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        paid_at TIMESTAMP NULL,
        INDEX idx_claim_facility (facility_id),
        INDEX idx_claim_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    try {
      await pool.query('ALTER TABLE facility_claims ADD COLUMN claim_token_hash CHAR(64) NULL')
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') throw error
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

    if (!existingColumns.includes('county')) {
      await pool.query(`ALTER TABLE facilities ADD COLUMN county VARCHAR(100) AFTER city`)
      console.log('✅ Added county column')
    }

    if (!existingColumns.includes('contact_person')) {
      await pool.query(`ALTER TABLE facilities ADD COLUMN contact_person VARCHAR(255) AFTER email`)
      console.log('✅ Added contact_person column')
    }

    if (!existingColumns.includes('whatsapp')) {
      await pool.query(`ALTER TABLE facilities ADD COLUMN whatsapp VARCHAR(20) AFTER phone`)
      console.log('✅ Added whatsapp column')
    }

    if (!existingColumns.includes('location_not_specified')) {
      await pool.query(`ALTER TABLE facilities ADD COLUMN location_not_specified BOOLEAN DEFAULT FALSE AFTER location`)
      console.log('✅ Added location_not_specified column')
    }

    if (!existingColumns.includes('map_coordinates')) {
      await pool.query(`ALTER TABLE facilities ADD COLUMN map_coordinates JSON AFTER location_not_specified`)
      console.log('✅ Added map_coordinates column')
    }

    // Modify location column to allow NULL if it's currently NOT NULL
    const [locationColumn] = await pool.query(`
      SELECT IS_NULLABLE, COLUMN_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'facilities'
      AND COLUMN_NAME = 'location'
    `)
    
    if (locationColumn.length > 0 && locationColumn[0].IS_NULLABLE === 'NO') {
      await pool.query(`ALTER TABLE facilities MODIFY COLUMN location VARCHAR(255)`)
      console.log('✅ Modified location column to allow NULL')
    }

    // Add columns for multiple phones, whatsapps, and emails
    if (!existingColumns.includes('phones')) {
      await pool.query(`ALTER TABLE facilities ADD COLUMN phones JSON AFTER phone`)
      console.log('✅ Added phones column')
    }

    if (!existingColumns.includes('whatsapps')) {
      await pool.query(`ALTER TABLE facilities ADD COLUMN whatsapps JSON AFTER whatsapp`)
      console.log('✅ Added whatsapps column')
    }

    if (!existingColumns.includes('emails')) {
      await pool.query(`ALTER TABLE facilities ADD COLUMN emails JSON AFTER email`)
      console.log('✅ Added emails column')
    }

    if (!existingColumns.includes('is_verified')) {
      await pool.query(`ALTER TABLE facilities ADD COLUMN is_verified TINYINT(1) NOT NULL DEFAULT 0`)
      console.log('✅ Added is_verified column')
    }
    
    // Add repair_categories for repair shops
    if (!existingColumns.includes('repair_categories')) {
      await pool.query(`ALTER TABLE facilities ADD COLUMN repair_categories JSON AFTER average_repair_time`)
      console.log('✅ Added repair_categories column')
    }
    if (!existingColumns.includes('is_company')) {
      await pool.query(`ALTER TABLE facilities ADD COLUMN is_company TINYINT(1) NOT NULL DEFAULT 0`)
      console.log('✅ Added facilities.is_company')
    }
    if (!existingColumns.includes('cui')) {
      await pool.query(`ALTER TABLE facilities ADD COLUMN cui VARCHAR(20) NULL`)
    }
    if (!existingColumns.includes('billing_address')) {
      await pool.query(`ALTER TABLE facilities ADD COLUMN billing_address VARCHAR(255) NULL`)
    }

    const [claimColumns] = await pool.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'facility_claims'
    `)
    const existingClaimColumns = claimColumns.map((col) => col.COLUMN_NAME)
    if (!existingClaimColumns.includes('is_company')) {
      await pool.query(`ALTER TABLE facility_claims ADD COLUMN is_company TINYINT(1) NOT NULL DEFAULT 0`)
      console.log('✅ Added facility_claims.is_company')
    }
    if (!existingClaimColumns.includes('cui')) {
      await pool.query(`ALTER TABLE facility_claims ADD COLUMN cui VARCHAR(20) NULL`)
    }
    if (!existingClaimColumns.includes('billing_address')) {
      await pool.query(`ALTER TABLE facility_claims ADD COLUMN billing_address VARCHAR(255) NULL`)
    }

    await pool.query(`
      UPDATE facilities f
      INNER JOIN facility_claims c ON c.facility_id = f.id
      INNER JOIN (
        SELECT facility_id, MAX(id) AS id
        FROM facility_claims
        WHERE status = 'completed'
        GROUP BY facility_id
      ) latest ON latest.id = c.id
      SET f.is_company = c.is_company,
          f.cui = COALESCE(f.cui, c.cui),
          f.billing_address = COALESCE(f.billing_address, c.billing_address)
    `)
    await pool.query(`
      UPDATE facilities
      SET phones = JSON_ARRAY(phone)
      WHERE (phones IS NULL OR JSON_LENGTH(phones) = 0)
        AND phone IS NOT NULL AND phone != '' AND phone != '0000000000'
    `)
    await pool.query(`
      UPDATE facilities
      SET emails = JSON_ARRAY(email)
      WHERE (emails IS NULL OR JSON_LENGTH(emails) = 0)
        AND email IS NOT NULL AND email != ''
    `)

    // Check pending_cities table for county column
    const [pendingCitiesColumns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'pending_cities'
    `)
    
    const existingPendingCitiesColumns = pendingCitiesColumns.map((col) => col.COLUMN_NAME)
    
    if (!existingPendingCitiesColumns.includes('county')) {
      await pool.query(`ALTER TABLE pending_cities ADD COLUMN county VARCHAR(100) AFTER city`)
      console.log('✅ Added county column to pending_cities')
    }

    if (!existingColumns.includes('subscription_ends_at')) {
      await pool.query(`ALTER TABLE facilities ADD COLUMN subscription_ends_at DATETIME NULL`)
      console.log('✅ Added subscription_ends_at column')
    }
    await pool.query(`
      UPDATE facilities f
      INNER JOIN (
        SELECT c.facility_id, c.paid_at, c.plan_code
        FROM facility_claims c
        INNER JOIN (
          SELECT facility_id, MAX(id) AS max_id
          FROM facility_claims
          WHERE status IN ('paid', 'completed') AND paid_at IS NOT NULL
          GROUP BY facility_id
        ) latest ON latest.max_id = c.id
      ) src ON src.facility_id = f.id
      SET f.subscription_ends_at = DATE_ADD(src.paid_at, INTERVAL IF(src.plan_code = 'owner_yearly', 12, 1) MONTH),
          f.is_verified = 1
      WHERE f.subscription_ends_at IS NULL
    `)
  } catch (error) {
    console.error('❌ Error adding missing columns:', error)
    // Don't throw, just log the error
  }
}

// Email configuration and sending functions
async function getSMTPConfig() {
  try {
    if (!pool) return null
    
    const [rows] = await pool.query(
      'SELECT setting_key, setting_value FROM site_settings WHERE setting_key LIKE "smtp_%"'
    )
    
    const config = {}
    rows.forEach((row) => {
      const key = row.setting_key.replace('smtp_', '')
      config[key] = row.setting_value
    })
    
    // Return null if SMTP is not configured
    if (!config.host || !config.port || !config.user || !config.password) {
      return null
    }
    
    return {
      host: config.host,
      port: parseInt(config.port) || 587,
      secure: config.secure === 'true' || config.port === '465',
      auth: {
        user: config.user,
        pass: config.password
      }
    }
  } catch (error) {
    console.error('Error getting SMTP config:', error)
    return null
  }
}

async function sendEmail(to, subject, html) {
  try {
    const smtpConfig = await getSMTPConfig()
    if (!smtpConfig) {
      console.log('⚠️ SMTP not configured, skipping email send')
      return { success: false, error: 'SMTP not configured' }
    }
    
    const transporter = nodemailer.createTransport(smtpConfig)
    
    const [fromRow] = await pool.query(
      'SELECT setting_value FROM site_settings WHERE setting_key = ?',
      ['smtp_from']
    )
    const fromEmail = fromRow.length > 0 ? fromRow[0].setting_value : smtpConfig.auth.user
    
    const info = await transporter.sendMail({
      from: `"Sportisia" <${fromEmail}>`,
      to,
      subject,
      html
    })
    
    console.log('✅ Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Error sending email:', error)
    return { success: false, error: error.message }
  }
}

// Initialize database on startup
// Initialize database on startup
let dbInitialized = false
initDatabase()
  .then(() => {
    dbInitialized = true
    console.log('✅ Database initialization completed')
  })
  .catch((error) => {
    console.error('❌ Failed to initialize database:', error)
    console.error('Error details:', error.message)
    console.error('DATABASE_URL is set:', !!process.env.DATABASE_URL)
    dbInitialized = false
    // Don't exit, but log the error - server will still start but endpoints will return 503
  })

// Geocoding endpoints - proxy pentru Nominatim (evită CORS)
app.get('/api/geocode', async (req, res) => {
  try {
    if (!rateLimit(req, res, 'geocode', 30, 60 * 1000)) return
    const { q, city } = req.query
    if (!q || String(q).length > 180) {
      return res.status(400).json({ error: 'Query parameter "q" is required' })
    }

    // Construiește query-ul cu orașul inclus pentru o căutare mai precisă
    let searchQuery = q.trim()
    if (city && city.trim()) {
      // Adaugă orașul și țara pentru o căutare mai precisă
      searchQuery = `${searchQuery}, ${city.trim()}, România`
    } else {
      // Dacă nu e oraș, adaugă doar țara
      searchQuery = `${searchQuery}, România`
    }

    console.log('Geocoding request for:', searchQuery)

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=ro`,
      {
        headers: {
          'User-Agent': 'Sportisia/1.0 (contact@sportisia.ro)'
        }
      }
    )

    if (!response.ok) {
      console.error('Nominatim API error:', response.status, response.statusText)
      throw new Error(`Nominatim API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('Geocoding result:', data.length, 'results')
    
    // Return array even if empty
    res.json(Array.isArray(data) ? data : [])
  } catch (error) {
    console.error('Geocoding error:', error)
    res.status(500).json({ error: 'Geocoding failed' })
  }
})

app.get('/api/reverse-geocode', async (req, res) => {
  try {
    if (!rateLimit(req, res, 'geocode', 30, 60 * 1000)) return
    const lat = Number(req.query.lat)
    const lon = Number(req.query.lon)
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({ error: 'Query parameters "lat" and "lon" are required' })
    }

    console.log('Reverse geocoding request for:', lat, lon)

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      {
        headers: {
          'User-Agent': 'Sportisia/1.0 (contact@sportisia.ro)'
        }
      }
    )

    if (!response.ok) {
      console.error('Nominatim API error:', response.status, response.statusText)
      throw new Error(`Nominatim API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('Reverse geocoding result:', data.display_name || 'No display name')
    
    res.json(data)
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    res.status(500).json({ error: 'Reverse geocoding failed' })
  }
})

function slugifyRo(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180)
}

async function uniqueBlogSlug(table, base, ignoreId) {
  const root = slugifyRo(base) || 'articol'
  for (let n = 0; n < 200; n += 1) {
    const candidate = n === 0 ? root : `${root}-${n}`
    const [rows] = await pool.query(`SELECT id FROM ${table} WHERE slug = ?`, [candidate])
    if (rows.length === 0 || (ignoreId && Number(rows[0].id) === Number(ignoreId))) return candidate
  }
  return `${root}-${Date.now()}`
}

function parseTags(value) {
  if (!value) return []
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean)
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return parsed.map((item) => String(item).trim()).filter(Boolean)
  } catch {
    return String(value).split(',').map((item) => item.trim()).filter(Boolean)
  }
  return []
}

app.get('/api/blog/categories', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM blog_categories ORDER BY sort_order ASC, name ASC')
    res.json({ success: true, data: rows })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.get('/api/blog/posts', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(24, Math.max(1, parseInt(req.query.limit, 10) || 12))
    const offset = (page - 1) * limit
    const q = String(req.query.q || '').trim()
    const categorySlug = String(req.query.category || '').trim()
    const params = []
    let where = `p.status = 'published' AND (p.published_at IS NULL OR p.published_at <= NOW())`
    if (q) {
      where += ' AND (p.title LIKE ? OR p.excerpt LIKE ?)'
      params.push(`%${q}%`, `%${q}%`)
    }
    if (categorySlug) {
      const [cats] = await pool.query('SELECT id FROM blog_categories WHERE slug = ?', [categorySlug])
      if (cats.length === 0) {
        return res.json({ success: true, data: [], pagination: { page, limit, total: 0, pages: 1 } })
      }
      const [children] = await pool.query('SELECT id FROM blog_categories WHERE parent_id = ?', [cats[0].id])
      const ids = [cats[0].id, ...children.map((row) => row.id)]
      where += ` AND p.category_id IN (${ids.map(() => '?').join(',')})`
      params.push(...ids)
    }
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM blog_posts p WHERE ${where}`,
      params
    )
    const [rows] = await pool.query(
      `SELECT p.id, p.title, p.slug, p.excerpt, p.cover_image, p.published_at, p.author_name, p.tags,
              c.name AS category_name, c.slug AS category_slug
       FROM blog_posts p
       LEFT JOIN blog_categories c ON c.id = p.category_id
       WHERE ${where}
       ORDER BY COALESCE(p.published_at, p.created_at) DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )
    const total = countRows[0].total
    res.json({
      success: true,
      data: rows.map((row) => ({ ...row, tags: parseTags(row.tags) })),
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.get('/api/blog/posts/:slug', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM blog_posts p
       LEFT JOIN blog_categories c ON c.id = p.category_id
       WHERE p.slug = ? AND p.status = 'published' AND (p.published_at IS NULL OR p.published_at <= NOW())`,
      [req.params.slug]
    )
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Articolul nu există.' })
    const post = rows[0]
    post.tags = parseTags(post.tags)
    const [comments] = await pool.query(
      `SELECT id, parent_id, author_name, body, rating, created_at FROM blog_comments
       WHERE post_id = ? AND status = 'approved' ORDER BY created_at ASC`,
      [post.id]
    )
    const [related] = await pool.query(
      `SELECT id, title, slug, excerpt, cover_image, published_at
       FROM blog_posts
       WHERE status = 'published' AND id != ? AND category_id <=> ?
       ORDER BY COALESCE(published_at, created_at) DESC LIMIT 3`,
      [post.id, post.category_id]
    )
    res.json({ success: true, data: { ...post, comments, related } })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/blog/posts/:slug/comments', async (req, res) => {
  try {
    if (!rateLimit(req, res, 'blog-comment', 5, 60 * 60 * 1000)) return
    const name = String(req.body.authorName || '').trim().slice(0, 80)
    const email = String(req.body.email || '').trim().toLowerCase().slice(0, 180)
    const body = String(req.body.body || '').trim().slice(0, 2000)
    let rating = req.body.rating ? parseInt(req.body.rating, 10) : null
    const parentId = req.body.parentId ? parseInt(req.body.parentId, 10) : null
    if (!name || !email || body.length < 5) {
      return res.status(400).json({ success: false, error: 'Completează numele, emailul și un mesaj de cel puțin 5 caractere.' })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Email invalid.' })
    }
    if (rating !== null && (rating < 1 || rating > 5)) {
      return res.status(400).json({ success: false, error: 'Nota trebuie să fie între 1 și 5.' })
    }
    const [posts] = await pool.query('SELECT id FROM blog_posts WHERE slug = ? AND status = \'published\'', [req.params.slug])
    if (posts.length === 0) return res.status(404).json({ success: false, error: 'Articolul nu există.' })
    if (parentId) {
      const [parents] = await pool.query('SELECT id, parent_id, post_id, status FROM blog_comments WHERE id = ?', [parentId])
      if (parents.length === 0 || parents[0].post_id !== posts[0].id || parents[0].status !== 'approved' || parents[0].parent_id) {
        return res.status(400).json({ success: false, error: 'Poți răspunde doar la un comentariu deja publicat.' })
      }
      rating = null
    }
    await pool.query(
      'INSERT INTO blog_comments (post_id, parent_id, author_name, email, body, rating, status) VALUES (?, ?, ?, ?, ?, ?, \'pending\')',
      [posts[0].id, parentId, name, email, body, rating]
    )
    res.json({ success: true, message: 'Comentariul a fost trimis și așteaptă aprobarea.' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/contact', async (req, res) => {
  try {
    if (!rateLimit(req, res, 'contact', 5, 60 * 60 * 1000)) return
    const name = String(req.body.name || '').trim().slice(0, 120)
    const email = String(req.body.email || '').trim().toLowerCase().slice(0, 180)
    const subject = String(req.body.subject || '').trim().slice(0, 180)
    const message = String(req.body.message || '').trim().slice(0, 4000)
    if (!name || !subject || message.length < 10) {
      return res.status(400).json({ success: false, error: 'Completează numele, subiectul și un mesaj de cel puțin 10 caractere.' })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Email invalid.' })
    }
    await pool.query(
      'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
      [name, email, subject, message]
    )
    const escape = (value) => value.replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[char]))
    await sendEmail(
      'contact@sportisia.ro',
      `Contact Sportisia: ${subject}`,
      `<p><strong>${escape(name)}</strong> (${escape(email)})</p><p>${escape(message).replace(/\n/g, '<br>')}</p>`
    )
    res.json({ success: true, message: 'Mesajul a fost trimis. Îți răspundem pe email.' })
  } catch (error) {
    console.error('Error saving contact message:', error)
    res.status(500).json({ success: false, error: 'Nu am putut trimite mesajul.' })
  }
})

app.use('/api/admin', (req, res, next) => {
  if (req.method === 'POST' && req.path === '/login') return next()
  return requireAdmin(req, res, next)
})

app.post('/api/admin/blog/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'Lipsește imaginea.' })
  res.json({ success: true, data: { url: `/uploads/blog/${req.file.filename}` } })
})

app.get('/api/admin/blog/categories', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM blog_categories ORDER BY sort_order ASC, name ASC')
    res.json({ success: true, data: rows })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/admin/blog/categories', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim()
    if (!name) return res.status(400).json({ success: false, error: 'Numele este obligatoriu.' })
    const parentId = req.body.parentId ? parseInt(req.body.parentId, 10) : null
    if (parentId) {
      const [parent] = await pool.query('SELECT parent_id FROM blog_categories WHERE id = ?', [parentId])
      if (parent.length === 0) return res.status(400).json({ success: false, error: 'Categoria părinte nu există.' })
      if (parent[0].parent_id) return res.status(400).json({ success: false, error: 'Subcategoriile nu pot avea la rândul lor copii.' })
    }
    const slug = await uniqueBlogSlug('blog_categories', req.body.slug || name)
    const [result] = await pool.query(
      `INSERT INTO blog_categories (name, slug, parent_id, description, meta_title, meta_description, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, slug, parentId, req.body.description || null, req.body.metaTitle || null, req.body.metaDescription || null, parseInt(req.body.sortOrder, 10) || 0]
    )
    res.json({ success: true, data: { id: result.insertId, slug } })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.put('/api/admin/blog/categories/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    const name = String(req.body.name || '').trim()
    if (!name) return res.status(400).json({ success: false, error: 'Numele este obligatoriu.' })
    const parentId = req.body.parentId ? parseInt(req.body.parentId, 10) : null
    if (parentId === id) return res.status(400).json({ success: false, error: 'O categorie nu poate fi părintele ei.' })
    if (parentId) {
      const [parent] = await pool.query('SELECT parent_id FROM blog_categories WHERE id = ?', [parentId])
      if (parent.length === 0 || parent[0].parent_id) {
        return res.status(400).json({ success: false, error: 'Poți alege doar o categorie principală ca părinte.' })
      }
    }
    const slug = await uniqueBlogSlug('blog_categories', req.body.slug || name, id)
    await pool.query(
      `UPDATE blog_categories SET name = ?, slug = ?, parent_id = ?, description = ?, meta_title = ?, meta_description = ?, sort_order = ? WHERE id = ?`,
      [name, slug, parentId, req.body.description || null, req.body.metaTitle || null, req.body.metaDescription || null, parseInt(req.body.sortOrder, 10) || 0, id]
    )
    res.json({ success: true, data: { slug } })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.delete('/api/admin/blog/categories/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    await pool.query('UPDATE blog_categories SET parent_id = NULL WHERE parent_id = ?', [id])
    await pool.query('UPDATE blog_posts SET category_id = NULL WHERE category_id = ?', [id])
    await pool.query('DELETE FROM blog_categories WHERE id = ?', [id])
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.get('/api/admin/blog/posts', async (req, res) => {
  try {
    const status = String(req.query.status || '')
    const q = String(req.query.q || '').trim()
    const params = []
    let where = '1=1'
    if (status === 'draft' || status === 'published') {
      where += ' AND p.status = ?'
      params.push(status)
    }
    if (q) {
      where += ' AND p.title LIKE ?'
      params.push(`%${q}%`)
    }
    const [rows] = await pool.query(
      `SELECT p.id, p.title, p.slug, p.status, p.published_at, p.updated_at, p.cover_image, c.name AS category_name
       FROM blog_posts p
       LEFT JOIN blog_categories c ON c.id = p.category_id
       WHERE ${where}
       ORDER BY p.updated_at DESC`,
      params
    )
    res.json({ success: true, data: rows })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.get('/api/admin/blog/posts/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM blog_posts WHERE id = ?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Articolul nu există.' })
    const post = rows[0]
    post.tags = parseTags(post.tags)
    res.json({ success: true, data: post })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

async function saveBlogPost(req, res, id) {
  const title = String(req.body.title || '').trim()
  if (!title) return res.status(400).json({ success: false, error: 'Titlul este obligatoriu.' })
  const status = req.body.status === 'published' ? 'published' : 'draft'
  const slug = await uniqueBlogSlug('blog_posts', req.body.slug || title, id)
  const tags = JSON.stringify(parseTags(req.body.tags))
  const categoryId = req.body.categoryId ? parseInt(req.body.categoryId, 10) : null
  const publishedAt = req.body.publishedAt || (status === 'published' ? new Date() : null)
  const values = [
    categoryId,
    title,
    slug,
    req.body.excerpt || null,
    req.body.content || '',
    req.body.coverImage || null,
    status,
    publishedAt,
    req.body.authorName || 'Admin',
    tags,
    req.body.metaTitle || null,
    req.body.metaDescription || null,
    req.body.canonicalUrl || null,
    req.body.ogImage || null,
    req.body.robots || 'index,follow'
  ]
  if (id) {
    await pool.query(
      `UPDATE blog_posts SET category_id = ?, title = ?, slug = ?, excerpt = ?, content = ?, cover_image = ?, status = ?, published_at = ?, author_name = ?, tags = ?, meta_title = ?, meta_description = ?, canonical_url = ?, og_image = ?, robots = ? WHERE id = ?`,
      [...values, id]
    )
    return res.json({ success: true, data: { id: Number(id), slug } })
  }
  const [result] = await pool.query(
    `INSERT INTO blog_posts (category_id, title, slug, excerpt, content, cover_image, status, published_at, author_name, tags, meta_title, meta_description, canonical_url, og_image, robots)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    values
  )
  res.json({ success: true, data: { id: result.insertId, slug } })
}

app.post('/api/admin/blog/posts', (req, res) => saveBlogPost(req, res))
app.put('/api/admin/blog/posts/:id', (req, res) => saveBlogPost(req, res, req.params.id))

app.delete('/api/admin/blog/posts/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM blog_posts WHERE id = ?', [req.params.id])
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.get('/api/admin/blog/comments', async (req, res) => {
  try {
    const status = String(req.query.status || '')
    const params = []
    let where = '1=1'
    if (['pending', 'approved', 'rejected'].includes(status)) {
      where += ' AND c.status = ?'
      params.push(status)
    }
    const [rows] = await pool.query(
      `SELECT c.*, p.title AS post_title, p.slug AS post_slug
       FROM blog_comments c
       JOIN blog_posts p ON p.id = c.post_id
       WHERE ${where}
       ORDER BY c.created_at DESC`,
      params
    )
    res.json({ success: true, data: rows })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.put('/api/admin/blog/comments/:id', async (req, res) => {
  try {
    const status = String(req.body.status || '')
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status invalid.' })
    }
    await pool.query('UPDATE blog_comments SET status = ? WHERE id = ?', [status, req.params.id])
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.get('/api/health', (_req, res) => {
  res.json({ success: true })
})

// API Routes

app.use('/api/fields', requireAdmin)

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

// POST register facility with file uploads
app.post('/api/register', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'gallery', maxCount: 10 }
]), async (req, res) => {
  try {
    if (!rateLimit(req, res, 'legacy-register', 5, 60 * 60 * 1000)) return
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    // Parse FormData fields (multer puts files in req.files, text fields in req.body)
    // Some fields come as JSON strings from FormData, need to parse them
    let phones, whatsapps, emails, socialMedia, pricingDetails, sportsFields, mapCoordinates
    try {
      phones = typeof req.body.phones === 'string' ? JSON.parse(req.body.phones) : req.body.phones
      whatsapps = typeof req.body.whatsapps === 'string' ? JSON.parse(req.body.whatsapps) : req.body.whatsapps
      emails = typeof req.body.emails === 'string' ? JSON.parse(req.body.emails) : req.body.emails
      socialMedia = typeof req.body.socialMedia === 'string' ? JSON.parse(req.body.socialMedia) : req.body.socialMedia
      pricingDetails = typeof req.body.pricingDetails === 'string' ? JSON.parse(req.body.pricingDetails) : req.body.pricingDetails
      sportsFields = typeof req.body.sportsFields === 'string' ? JSON.parse(req.body.sportsFields) : req.body.sportsFields
      mapCoordinates = typeof req.body.mapCoordinates === 'string' ? JSON.parse(req.body.mapCoordinates) : req.body.mapCoordinates
    } catch (e) {
      console.error('Error parsing JSON fields from FormData:', e)
    }
    
    const {
      facilityType, // 'field', 'coach', 'repair_shop', 'equipment_shop'
      name, city, county, location, contactPerson, phone, whatsapp, email, description, imageUrl,
      // Field specific (sport is also used for equipment shops - can be 'general' or specific sport)
      sport, hasParking, hasShower, hasChangingRoom, hasAirConditioning, hasLighting,
      // Coach specific
      specialization, experienceYears, certifications, languages,
      // Repair shop specific
      servicesOffered, brandsServiced, averageRepairTime, repairCategories,
      // Equipment shop specific
      productsCategories, brandsAvailable, deliveryAvailable,
      // Common
      website, openingHours
    } = req.body
    
    // Parse boolean and location fields
    const locationNotSpecified = req.body.locationNotSpecified === 'true' || req.body.locationNotSpecified === true
    const hasParkingBool = req.body.hasParking === 'true' || req.body.hasParking === true
    const hasShowerBool = req.body.hasShower === 'true' || req.body.hasShower === true
    const hasChangingRoomBool = req.body.hasChangingRoom === 'true' || req.body.hasChangingRoom === true
    const hasAirConditioningBool = req.body.hasAirConditioning === 'true' || req.body.hasAirConditioning === true
    const hasLightingBool = req.body.hasLighting === 'true' || req.body.hasLighting === true
    
    // Extract pricePerHour separately
    let pricePerHour = req.body.pricePerHour ? parseFloat(req.body.pricePerHour) : null
    let pricePerLesson = req.body.pricePerLesson ? parseFloat(req.body.pricePerLesson) : null

    // Validate required fields
    const primaryPhone = phone || (phones && Array.isArray(phones) && phones.length > 0 ? phones[0] : null)
    const primaryEmail = email || (emails && Array.isArray(emails) && emails.length > 0 ? emails[0] : null)
    
    if (!facilityType || !name || !city || (!location && !locationNotSpecified) || !primaryPhone || !primaryEmail) {
      return res.status(400).json({
        success: false,
        error: 'Lipsește informație obligatorie'
      })
    }

    // Validate facility type specific fields
    // For fields, check if sport is provided OR if sportsFields array is provided
    let parsedSportsFields = sportsFields
    if (facilityType === 'field') {
      if (sportsFields) {
        try {
          parsedSportsFields = sportsFields // Already parsed above
          if (!Array.isArray(parsedSportsFields) || parsedSportsFields.length === 0) {
            return res.status(400).json({
              success: false,
              error: 'Pentru baze sportive, cel puțin un teren este obligatoriu'
            })
          }
          // Validate each field
          for (const field of parsedSportsFields) {
            if (!field.fieldName || !field.sportType) {
              return res.status(400).json({
                success: false,
                error: 'Fiecare teren trebuie să aibă nume și tip sport'
              })
            }
            
            // Check if field has time slots configured
            if (!field.timeSlots || !Array.isArray(field.timeSlots) || field.timeSlots.length === 0) {
              return res.status(400).json({
                success: false,
                error: 'Fiecare teren trebuie să aibă cel puțin un interval de timp configurat'
              })
            }
            
            // Check if at least one time slot has a price OR has unspecified price flag (for open slots)
            const hasValidOpenSlot = field.timeSlots.some(slot => {
              if (slot.status !== 'open') return false
              // Slot is valid if it has a price (not null and > 0) OR has unspecified price flag
              const hasPrice = slot.price !== null && slot.price !== undefined && slot.price > 0
              const hasUnspecifiedPrice = slot.isPriceUnspecified === true
              return hasPrice || hasUnspecifiedPrice
            })
            
            // Note: We allow slots with 'not_specified' or 'closed' status, but at least one should have a price or unspecified price
            // If all slots are closed or not_specified, that's also acceptable (facility can set prices later)
            // But if there are open slots, at least one should have a price or unspecified price
            const hasOpenSlots = field.timeSlots.some(slot => slot.status === 'open')
            if (hasOpenSlots && !hasValidOpenSlot) {
              return res.status(400).json({
                success: false,
                error: 'Fiecare teren trebuie să aibă cel puțin un interval deschis cu preț configurat sau cu preț nespecificat'
              })
            }
          }
        } catch (e) {
          return res.status(400).json({
            success: false,
            error: 'Format invalid pentru terenuri'
          })
        }
      } else if (!sport || (pricingDetails && pricingDetails.length === 0 && !pricePerHour)) {
        return res.status(400).json({
          success: false,
          error: 'Pentru terenuri, sport și cel puțin un preț sunt obligatorii'
        })
      }
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

    // Process logo file (from uploaded file)
    let logoUrlFinal = null
    console.log('[REGISTER] Processing logo - req.files.logo:', req.files?.logo)
    if (req.files && req.files.logo && req.files.logo.length > 0) {
      const uploadedLogo = req.files.logo[0]
      logoUrlFinal = `/uploads/logos/${uploadedLogo.filename}`
      console.log('[REGISTER] Logo uploaded, logoUrlFinal:', logoUrlFinal)
    } else {
      // Check if logo is sent as base64 in body (fallback for old clients)
      const logoFile = req.body.logoFile || req.body.logo
      if (logoFile && typeof logoFile === 'string' && logoFile.startsWith('data:image')) {
        // Fallback: if base64 is still sent, save it as file
        const base64Data = logoFile.replace(/^data:image\/\w+;base64,/, '')
        const buffer = Buffer.from(base64Data, 'base64')
        const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(8).toString('hex')
        const filename = `${uniqueSuffix}.jpg`
        const logoDir = path.join(__dirname, 'uploads', 'logos')
        if (!existsSync(logoDir)) mkdirSync(logoDir, { recursive: true })
        writeFileSync(path.join(logoDir, filename), buffer)
        logoUrlFinal = `/uploads/logos/${filename}`
        console.log('[REGISTER] Logo saved from base64, logoUrlFinal:', logoUrlFinal)
      }
    }

    // Process gallery files (from uploaded files)
    let galleryFinal = null
    console.log('[REGISTER] Processing gallery - req.files.gallery:', req.files?.gallery)
    if (req.files && req.files.gallery && req.files.gallery.length > 0) {
      galleryFinal = req.files.gallery.map(file => `/uploads/gallery/${file.filename}`)
      console.log('[REGISTER] Gallery uploaded, galleryFinal:', galleryFinal)
    } else {
      // Check if gallery is sent as base64 array in body (fallback for old clients)
      const gallery = req.body.gallery
      if (gallery && Array.isArray(gallery) && gallery.length > 0) {
        // Fallback: if base64 is still sent, save them as files
        galleryFinal = []
        const galleryDir = path.join(__dirname, 'uploads', 'gallery')
        if (!existsSync(galleryDir)) mkdirSync(galleryDir, { recursive: true })
        
        for (const base64Image of gallery) {
          if (typeof base64Image === 'string' && base64Image.startsWith('data:image')) {
            const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '')
            const buffer = Buffer.from(base64Data, 'base64')
            const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(8).toString('hex')
            const filename = `${uniqueSuffix}.jpg`
            writeFileSync(path.join(galleryDir, filename), buffer)
            galleryFinal.push(`/uploads/gallery/${filename}`)
          }
        }
        console.log('[REGISTER] Gallery saved from base64, galleryFinal:', galleryFinal)
      }
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
        facilityType, name, city, county || null, 
        locationNotSpecified ? null : (location || null), 
        locationNotSpecified,
        mapCoordinates ? JSON.stringify(mapCoordinates) : null,
        primaryPhone, phones ? JSON.stringify(phones) : null, whatsapp || null, whatsapps ? JSON.stringify(whatsapps) : null, primaryEmail, emails ? JSON.stringify(emails) : null, contactPerson || null, 
        description || null, imageUrl || null,
        logoUrlFinal || null, 
        socialMedia ? JSON.stringify(socialMedia) : null,
        galleryFinal ? JSON.stringify(galleryFinal) : null,
        // sport: for fields use sport, for equipment shops use sport (can be 'general'), for others null
        (facilityType === 'field' || facilityType === 'equipment_shop') ? (sport || null) : null,
        pricePerHour,
        pricingDetails ? JSON.stringify(pricingDetails) : null,
        hasParkingBool || false, hasShowerBool || false, hasChangingRoomBool || false,
        hasAirConditioningBool || false, hasLightingBool || false,
        specialization || null, experienceYears || null, pricePerLesson ? parseFloat(pricePerLesson) : null,
        certifications || null, languages || null,
        servicesOffered || null, brandsServiced || null, averageRepairTime || null,
        repairCategories ? JSON.stringify(repairCategories) : null,
        productsCategories || null, brandsAvailable || null, deliveryAvailable || false,
        website || null, openingHours || null,
        'pending' // status
      ]

      // Verify values count - MUST BE 42 (42 columns in INSERT)
      if (values.length !== 42) {
        const errorMsg = `Values array must have 42 elements, but has ${values.length}. Last value: ${values[values.length - 1]}`
        console.error(`[REGISTER ERROR] ${errorMsg}`)
        throw new Error(errorMsg)
      }

      // Debug: log values count
      console.log(`[REGISTER] Inserting facility: ${name}`)
      console.log(`[REGISTER] Values count: ${values.length}, expected: 42`)
      console.log(`[REGISTER] Last value (status): ${values[41]}`)

      // Insert facility
      // Note: sport is used for both fields and equipment shops
      // For fields: specific sport, for equipment shops: 'general' or specific sport
      const [facilityResult] = await connection.query(
        `INSERT INTO facilities (
          facility_type, name, city, county, location, location_not_specified, map_coordinates, phone, phones, whatsapp, whatsapps, email, emails, contact_person, description, image_url,
          logo_url, social_media, gallery,
          sport, price_per_hour, pricing_details, has_parking, has_shower, has_changing_room, 
          has_air_conditioning, has_lighting,
          specialization, experience_years, price_per_lesson, certifications, languages,
          services_offered, brands_serviced, average_repair_time, repair_categories,
          products_categories, brands_available, delivery_available,
          website, opening_hours, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        values
      )

      const facilityId = facilityResult.insertId
      console.log(`[REGISTER] Facility inserted with ID: ${facilityId}`)
      console.log(`[REGISTER] logoUrlFinal:`, logoUrlFinal)
      console.log(`[REGISTER] galleryFinal:`, galleryFinal)
      console.log(`[REGISTER] galleryFinal JSON:`, galleryFinal ? JSON.stringify(galleryFinal) : null)

      // Insert sports fields if provided (for sports bases with multiple fields)
      if (facilityType === 'field' && parsedSportsFields && parsedSportsFields.length > 0) {
        console.log(`[REGISTER] Inserting ${parsedSportsFields.length} sports fields for facility ${facilityId}`)
        for (const field of parsedSportsFields) {
          // Calculate legacy pricePerHour from first open slot with price for backward compatibility
          const legacyPricePerHour = field.timeSlots && field.timeSlots.length > 0
            ? (field.timeSlots.find(slot => slot.status === 'open' && slot.price !== null)?.price || null)
            : null

          await connection.query(
            `INSERT INTO facility_sports_fields (facility_id, sport_type, field_name, price_per_hour, description, features, slot_size, time_slots)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              facilityId,
              field.sportType,
              field.fieldName || null,
              legacyPricePerHour ? parseFloat(legacyPricePerHour) : null, // Legacy field for backward compatibility
              field.description || null,
              JSON.stringify(field.features || {}),
              field.slotSize || 60, // Default 60 minutes
              JSON.stringify(field.timeSlots || [])
            ]
          )
        }
        console.log(`[REGISTER] Successfully inserted ${parsedSportsFields.length} sports fields`)
      }

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
            'INSERT INTO pending_cities (city, county, status) VALUES (?, ?, ?)',
            [city.trim(), county || null, 'pending']
          )
        }
      }

      // Check if sport(s) is/are new and add to pending_sports if needed
      const sportsToCheck = []
      if (facilityType === 'field' && parsedSportsFields && parsedSportsFields.length > 0) {
        // Extract unique sports from sportsFields
        parsedSportsFields.forEach(field => {
          if (field.sportType) {
            sportsToCheck.push(field.sportType.trim().toLowerCase())
          }
        })
      } else if (sport) {
        sportsToCheck.push(sport.trim().toLowerCase())
      }
      
      // Add unique sports to pending_sports if they don't exist
      const uniqueSports = [...new Set(sportsToCheck)]
      for (const sportToCheck of uniqueSports) {
        const [existingSport] = await connection.query(
          'SELECT * FROM pending_sports WHERE sport = ?',
          [sportToCheck]
        )
        
        if (existingSport.length === 0) {
          // Add as pending
          await connection.query(
            'INSERT INTO pending_sports (sport, status) VALUES (?, ?)',
            [sportToCheck, 'pending']
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

      console.log(`✅ Facility registered successfully: ID=${facilityId}, Name=${name}, Type=${facilityType}, Status=pending`)

      // Send email with credentials
      try {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #10b981; margin-bottom: 20px;">Înregistrare reușită - ${name}</h2>
            <p>Bună ziua,</p>
            <p>Baza ta sportivă <strong>${name}</strong> a fost înregistrată cu succes pe platforma Sportisia.</p>
            <p>Contul tău a fost creat cu următoarele credențiale:</p>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
              <p style="margin: 10px 0;"><strong>Username:</strong> <code style="background: white; padding: 5px 10px; border-radius: 4px; font-family: monospace;">${username}</code></p>
              <p style="margin: 10px 0;"><strong>Parolă:</strong> <code style="background: white; padding: 5px 10px; border-radius: 4px; font-family: monospace;">${password}</code></p>
            </div>
            <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e;"><strong>Important:</strong> Salvează aceste credențiale! Vei avea nevoie de ele pentru a accesa și edita detaliile bazei tale sportive.</p>
            </div>
            <p><strong>Următorii pași:</strong></p>
            <ul>
              <li>Cererea ta este în așteptarea aprobării de către administrator</li>
              <li>După aprobare, baza ta sportivă va deveni publică pe platformă</li>
              <li>Vei primi o notificare când cererea va fi aprobată</li>
            </ul>
            <p>Poți accesa contul tău la: <a href="${process.env.FRONTEND_URL || 'https://sportisia.ro'}/login">${process.env.FRONTEND_URL || 'https://sportisia.ro'}/login</a></p>
            <p>Îți mulțumim pentru înregistrare!</p>
            <p style="margin-top: 30px; color: #64748b; font-size: 14px;">Echipa Sportisia</p>
          </div>
        `
        
        const emailResult = await sendEmail(
          email,
          `Înregistrare reușită - ${name}`,
          emailHtml
        )
        
        if (emailResult.success) {
          console.log(`✅ Email sent successfully to ${email}`)
        } else {
          console.warn(`⚠️ Failed to send email to ${email}:`, emailResult.error)
        }
      } catch (emailError) {
        console.error('❌ Error sending email:', emailError)
        // Don't fail the registration if email fails
      }

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
      console.error('❌ Transaction rolled back:', error)
      throw error
    }
  } catch (error) {
    console.error('❌ Error registering facility:', error)
    console.error('❌ Error message:', error.message)
    console.error('❌ Error stack:', error.stack)
    console.error('❌ Error stack:', error.stack)
    console.error('❌ Request body:', JSON.stringify(req.body, null, 2))
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Eroare la înregistrare',
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

    if (!rateLimit(req, res, 'login', 10, 15 * 60 * 1000)) return
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
       WHERE (u.username = ? OR u.email = ?) AND u.password = ?`,
      [username, String(username).trim().toLowerCase(), hashedPassword]
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
      token: signToken({ role: 'user', id: user.id, username: user.username, facilityId: user.facility_id }, 14 * 24 * 60 * 60),
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

    const session = requireUser(req, res)
    if (!session) return

    const [rows] = await pool.query(
      `SELECT f.*, u.username, u.email as user_email
       FROM facilities f
       INNER JOIN users u ON f.id = u.facility_id AND f.facility_type = u.facility_type
       WHERE u.username = ?`,
      [session.username]
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

// POST reset password for user (self-service)
app.post('/api/users/reset-password', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    if (!rateLimit(req, res, 'reset-password', 5, 60 * 60 * 1000)) return
    const session = requireUser(req, res)
    if (!session) return

    const newPassword = crypto.randomBytes(8).toString('hex')
    const hashedPassword = hashPassword(newPassword)

    const [result] = await pool.query(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND username = ?',
      [hashedPassword, session.id, session.username]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Utilizatorul nu a fost găsit'
      })
    }

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

// PUT update facility
app.put('/api/facilities/:id', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    const facilityId = req.params.id
    const auth = verifyToken(bearerToken(req))
    const isAdmin = auth?.role === 'admin'
    const isOwner = auth?.role === 'user' && Number(auth.facilityId) === Number(facilityId)
    if (!isAdmin && !isOwner) {
      return res.status(401).json({ success: false, error: 'Neautorizat' })
    }
    const body = req.body
    const name = body.name
    const city = body.city
    const county = body.county
    const location = body.location
    const locationNotSpecified = body.locationNotSpecified ?? body.location_not_specified
    const mapCoordinates = body.mapCoordinates ?? body.map_coordinates
    const contactPerson = body.contactPerson ?? body.contact_person
    const phone = body.phone
    const phones = body.phones
    const whatsapp = body.whatsapp
    const whatsapps = body.whatsapps
    const email = body.email
    const emails = body.emails
    const description = body.description
    const imageUrl = body.imageUrl ?? body.image_url
    const logoUrl = body.logoUrl ?? body.logo_url
    const socialMedia = body.socialMedia ?? body.social_media
    const gallery = body.gallery
    const sport = body.sport
    const pricePerHour = body.pricePerHour ?? body.price_per_hour
    const pricingDetails = body.pricingDetails ?? body.pricing_details
    const hasParking = body.hasParking ?? body.has_parking
    const hasShower = body.hasShower ?? body.has_shower
    const hasChangingRoom = body.hasChangingRoom ?? body.has_changing_room
    const hasAirConditioning = body.hasAirConditioning ?? body.has_air_conditioning
    const hasLighting = body.hasLighting ?? body.has_lighting
    const specialization = body.specialization
    const experienceYears = body.experienceYears ?? body.experience_years
    const pricePerLesson = body.pricePerLesson ?? body.price_per_lesson
    const certifications = body.certifications
    const languages = body.languages
    const servicesOffered = body.servicesOffered ?? body.services_offered
    const brandsServiced = body.brandsServiced ?? body.brands_serviced
    const averageRepairTime = body.averageRepairTime ?? body.average_repair_time
    const repairCategories = body.repairCategories ?? body.repair_categories
    const productsCategories = body.productsCategories ?? body.products_categories
    const brandsAvailable = body.brandsAvailable ?? body.brands_available
    const deliveryAvailable = body.deliveryAvailable ?? body.delivery_available
    const website = body.website
    const openingHours = body.openingHours ?? body.opening_hours
    const status = body.status
    const isCompany = body.isCompany ?? body.is_company
    const cui = body.cui
    const billingAddress = body.billingAddress ?? body.billing_address

    // Build update query dynamically based on facility type
    const updates = []
    const values = []

    if (name) { updates.push('name = ?'); values.push(name) }
    if (city) { updates.push('city = ?'); values.push(city) }
    if (county !== undefined) { updates.push('county = ?'); values.push(county) }
    if (location !== undefined) { updates.push('location = ?'); values.push(location) }
    if (locationNotSpecified !== undefined) { updates.push('location_not_specified = ?'); values.push(locationNotSpecified) }
    if (mapCoordinates !== undefined) { updates.push('map_coordinates = ?'); values.push(JSON.stringify(mapCoordinates)) }
    if (contactPerson !== undefined) { updates.push('contact_person = ?'); values.push(contactPerson) }
    const parseList = (value) => {
      if (Array.isArray(value)) return value
      if (typeof value !== 'string' || !value) return null
      try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed) ? parsed : null
      } catch {
        return null
      }
    }
    const phoneList = parseList(phones)
    const primaryPhone = Array.isArray(phoneList) ? String(phoneList.find((item) => String(item || '').trim()) || '').trim() : ''
    if (primaryPhone) { updates.push('phone = ?'); values.push(primaryPhone) }
    else if (phone) { updates.push('phone = ?'); values.push(phone) }
    if (phones !== undefined) { updates.push('phones = ?'); values.push(typeof phones === 'string' ? phones : JSON.stringify(phones)) }
    if (whatsapp !== undefined) { updates.push('whatsapp = ?'); values.push(whatsapp) }
    if (whatsapps !== undefined) { updates.push('whatsapps = ?'); values.push(typeof whatsapps === 'string' ? whatsapps : JSON.stringify(whatsapps)) }
    const emailList = parseList(emails)
    const primaryEmail = Array.isArray(emailList) ? String(emailList.find((item) => String(item || '').trim()) || '').trim() : ''
    if (primaryEmail) { updates.push('email = ?'); values.push(primaryEmail) }
    else if (email !== undefined) { updates.push('email = ?'); values.push(email) }
    if (emails !== undefined) { updates.push('emails = ?'); values.push(typeof emails === 'string' ? emails : JSON.stringify(emails)) }
    if (description !== undefined) { updates.push('description = ?'); values.push(description) }
    if (imageUrl !== undefined) { updates.push('image_url = ?'); values.push(imageUrl) }
    if (logoUrl !== undefined) { updates.push('logo_url = ?'); values.push(logoUrl) }
    if (socialMedia !== undefined) { updates.push('social_media = ?'); values.push(typeof socialMedia === 'string' ? socialMedia : JSON.stringify(socialMedia)) }
    if (gallery !== undefined) { updates.push('gallery = ?'); values.push(typeof gallery === 'string' ? gallery : JSON.stringify(gallery)) }
    if (website !== undefined) { updates.push('website = ?'); values.push(website) }
    if (openingHours !== undefined) { updates.push('opening_hours = ?'); values.push(openingHours) }
    if (status && isAdmin) { updates.push('status = ?'); values.push(status) }

    // Field specific
    if (sport !== undefined) { updates.push('sport = ?'); values.push(sport) }
    if (pricePerHour !== undefined && pricePerHour !== '') {
      const parsedPrice = parseFloat(pricePerHour)
      if (!Number.isNaN(parsedPrice)) { updates.push('price_per_hour = ?'); values.push(parsedPrice) }
    }
    if (pricingDetails !== undefined) { updates.push('pricing_details = ?'); values.push(JSON.stringify(pricingDetails)) }
    if (hasParking !== undefined) { updates.push('has_parking = ?'); values.push(hasParking) }
    if (hasShower !== undefined) { updates.push('has_shower = ?'); values.push(hasShower) }
    if (hasChangingRoom !== undefined) { updates.push('has_changing_room = ?'); values.push(hasChangingRoom) }
    if (hasAirConditioning !== undefined) { updates.push('has_air_conditioning = ?'); values.push(hasAirConditioning) }
    if (hasLighting !== undefined) { updates.push('has_lighting = ?'); values.push(hasLighting) }

    // Coach specific
    if (specialization !== undefined) { updates.push('specialization = ?'); values.push(specialization) }
    if (experienceYears !== undefined && experienceYears !== '') {
      const parsedYears = parseInt(experienceYears, 10)
      if (!Number.isNaN(parsedYears)) { updates.push('experience_years = ?'); values.push(parsedYears) }
    }
    if (pricePerLesson !== undefined && pricePerLesson !== '') {
      const parsedLesson = parseFloat(pricePerLesson)
      if (!Number.isNaN(parsedLesson)) { updates.push('price_per_lesson = ?'); values.push(parsedLesson) }
    }
    if (certifications !== undefined) { updates.push('certifications = ?'); values.push(certifications) }
    if (languages !== undefined) { updates.push('languages = ?'); values.push(languages) }

    // Repair shop specific
    if (servicesOffered !== undefined) { updates.push('services_offered = ?'); values.push(servicesOffered) }
    if (brandsServiced !== undefined) { updates.push('brands_serviced = ?'); values.push(brandsServiced) }
    if (averageRepairTime !== undefined) { updates.push('average_repair_time = ?'); values.push(averageRepairTime) }
    if (repairCategories !== undefined) {
      updates.push('repair_categories = ?')
      values.push(typeof repairCategories === 'string' ? repairCategories : JSON.stringify(repairCategories))
    }

    // Equipment shop specific
    if (productsCategories !== undefined) { updates.push('products_categories = ?'); values.push(productsCategories) }
    if (brandsAvailable !== undefined) { updates.push('brands_available = ?'); values.push(brandsAvailable) }
    if (deliveryAvailable !== undefined) { updates.push('delivery_available = ?'); values.push(deliveryAvailable ? 1 : 0) }
    if (isCompany !== undefined) { updates.push('is_company = ?'); values.push(isCompany ? 1 : 0) }
    if (cui !== undefined) { updates.push('cui = ?'); values.push(String(cui || '').replace(/\s/g, '').toUpperCase() || null) }
    if (billingAddress !== undefined) { updates.push('billing_address = ?'); values.push(billingAddress || null) }

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

    if (isOwner && primaryEmail) {
      await pool.query('UPDATE users SET email = ? WHERE id = ?', [primaryEmail, auth.id])
    }
    const [typeRows] = await pool.query('SELECT facility_type, name FROM facilities WHERE id = ?', [facilityId])
    if (typeRows[0]?.facility_type === 'field' && (sport !== undefined || pricePerHour !== undefined)) {
      const nextPrice = pricePerHour !== undefined && pricePerHour !== '' ? parseFloat(pricePerHour) : null
      if (nextPrice !== null && !Number.isNaN(nextPrice)) {
        await pool.query('UPDATE facility_sports_fields SET price_per_hour = ? WHERE facility_id = ?', [nextPrice, facilityId])
      }
      if (sport) {
        const [fields] = await pool.query('SELECT id FROM facility_sports_fields WHERE facility_id = ?', [facilityId])
        if (fields.length === 1) {
          await pool.query('UPDATE facility_sports_fields SET sport_type = ? WHERE id = ?', [sport, fields[0].id])
        } else if (fields.length === 0) {
          await pool.query(
            'INSERT INTO facility_sports_fields (facility_id, field_name, sport_type, price_per_hour) VALUES (?, ?, ?, ?)',
            [facilityId, name || typeRows[0].name || 'Teren', sport, nextPrice]
          )
        }
      }
    }

    res.json({
      success: true,
      message: 'Facilitatea a fost actualizată cu succes'
    })
  } catch (error) {
    console.error('Error updating facility:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

const SUBSCRIPTION_PLANS = [
  {
    code: 'owner_monthly',
    name: 'Lunar',
    amount: 49,
    currency: 'RON',
    interval: 'lună',
    discountPercent: 0
  },
  {
    code: 'owner_yearly',
    name: 'Anual',
    amount: 394,
    compareAt: 588,
    currency: 'RON',
    interval: 'an',
    discountPercent: 33
  }
]

function getPlan(code) {
  return SUBSCRIPTION_PLANS.find((plan) => plan.code === code) || SUBSCRIPTION_PLANS[0]
}

function subscriptionMonths(planCode) {
  return planCode === 'owner_yearly' ? 12 : 1
}

function attachProfileTier(facility) {
  const ends = facility.subscription_ends_at ? new Date(facility.subscription_ends_at) : null
  const active = ends && !Number.isNaN(ends.getTime()) && ends.getTime() > Date.now()
  if (active) facility.profile_tier = 'recommended'
  else if (Number(facility.is_verified) === 1) facility.profile_tier = 'verified'
  else facility.profile_tier = 'unverified'
  facility.can_claim = facility.profile_tier === 'unverified'
}

function netopiaIsConfigured() {
  return Boolean(process.env.NETOPIA_SIGNATURE && process.env.NETOPIA_API_KEY)
}

app.get('/api/subscription-plan', (_req, res) => {
  res.json({
    success: true,
    data: {
      plans: SUBSCRIPTION_PLANS,
      paymentMode: netopiaIsConfigured() ? 'netopia' : 'simulation'
    }
  })
})

app.post('/api/registrations', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }
    if (!rateLimit(req, res, 'register', 8, 60 * 60 * 1000)) return
    const facilityType = String(req.body.facilityType || '').trim()
    const name = String(req.body.facilityName || '').trim()
    const city = String(req.body.city || '').trim()
    const allowed = ['field', 'coach', 'repair_shop', 'equipment_shop']
    if (!allowed.includes(facilityType) || !name || !city) {
      return res.status(400).json({ success: false, error: 'Completează tipul, denumirea și orașul.' })
    }
    const phone = String(req.body.phone || '').trim()
    const email = String(req.body.email || '').trim().toLowerCase()
    const ownerName = `${String(req.body.firstName || '').trim()} ${String(req.body.lastName || '').trim()}`.trim()
    const [created] = await pool.query(
      `INSERT INTO facilities (facility_type, name, city, phone, email, contact_person, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [facilityType, name, city, phone || '0000000000', email || null, ownerName || null]
    )
    req.params.id = String(created.insertId)
    return createFacilityClaim(req, res)
  } catch (error) {
    console.error('Error starting registration:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

async function createFacilityClaim(req, res) {
  try {
    if (!rateLimit(req, res, 'claim', 8, 60 * 60 * 1000)) return
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    const facilityId = parseInt(req.params.id, 10)
    const firstName = String(req.body.firstName || '').trim()
    const lastName = String(req.body.lastName || '').trim()
    const ownerName = String(req.body.ownerName || `${firstName} ${lastName}`).trim()
    const email = String(req.body.email || '').trim().toLowerCase()
    const phone = String(req.body.phone || '').trim()
    const password = String(req.body.password || '')
    const plan = getPlan(req.body.planCode)
    const isCompany = req.body.isCompany === true || req.body.isCompany === 1 || req.body.isCompany === 'true'
    const cui = String(req.body.cui || '').replace(/\s/g, '').toUpperCase()
    const billingAddress = String(req.body.billingAddress || '').trim()

    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ success: false, error: 'Completează numele, prenumele, emailul, telefonul și parola.' })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Email invalid.' })
    }
    if (!(password.length >= 9 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password))) {
      return res.status(400).json({ success: false, error: 'Parola trebuie să aibă minim 9 caractere, o literă mică, o literă mare, o cifră și un caracter special.' })
    }
    if (isCompany) {
      if (!/^(RO)?\d{2,10}$/.test(cui)) {
        return res.status(400).json({ success: false, error: 'CUI invalid. Exemplu: RO12345678.' })
      }
      if (billingAddress.length < 5) {
        return res.status(400).json({ success: false, error: 'Completează adresa de facturare.' })
      }
    }

    const [facilities] = await pool.query('SELECT id, name, facility_type, is_verified, status FROM facilities WHERE id = ?', [facilityId])
    if (facilities.length === 0) {
      return res.status(404).json({ success: false, error: 'Facilitatea nu există.' })
    }
    const facility = facilities[0]
    if (Number(facility.is_verified) === 1) {
      return res.status(409).json({ success: false, error: 'Această facilitate este deja revendicată și verificată.' })
    }

    const [existingClaims] = await pool.query(
      `SELECT id, status, username, password_hash FROM facility_claims
       WHERE facility_id = ? AND email = ? AND status IN ('awaiting_payment', 'paid')
       ORDER BY id DESC LIMIT 1`,
      [facilityId, email]
    )
    let username = existingClaims[0]?.username || ''
    if (!username) {
      const base = (email.split('@')[0] || 'proprietar').toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 24) || 'proprietar'
      username = base.length >= 3 ? base : `${base}user`
      for (let n = 0; n < 50; n += 1) {
        const candidate = n === 0 ? username : `${username}${n}`.slice(0, 30)
        const [taken] = await pool.query('SELECT id FROM users WHERE username = ?', [candidate])
        if (taken.length === 0) {
          username = candidate
          break
        }
      }
    }
    if (existingClaims.length > 0) {
      if (existingClaims[0].password_hash !== hashPassword(password)) {
        return res.status(401).json({ success: false, error: 'Există deja o cerere pentru acest email. Parola nu corespunde.' })
      }
      if (existingClaims[0].status === 'awaiting_payment') {
        await pool.query(
          'UPDATE facility_claims SET plan_code = ?, amount = ?, is_company = ?, cui = ?, billing_address = ? WHERE id = ?',
          [plan.code, plan.amount, isCompany ? 1 : 0, isCompany ? cui : null, isCompany ? billingAddress : null, existingClaims[0].id]
        )
      }
      const claimToken = crypto.randomBytes(32).toString('base64url')
      await pool.query('UPDATE facility_claims SET claim_token_hash = ? WHERE id = ?', [crypto.createHash('sha256').update(claimToken).digest('hex'), existingClaims[0].id])
      return res.json({
        success: true,
        data: {
          claimId: existingClaims[0].id,
          facilityId,
          status: existingClaims[0].status,
          plan,
          resumed: true,
          claimToken
        }
      })
    }

    const claimToken = crypto.randomBytes(32).toString('base64url')
    const [result] = await pool.query(
      `INSERT INTO facility_claims
        (facility_id, owner_name, email, phone, username, password_hash, status, plan_code, amount, currency, payment_provider, is_company, cui, billing_address, claim_token_hash)
       VALUES (?, ?, ?, ?, ?, ?, 'awaiting_payment', ?, ?, ?, 'netopia', ?, ?, ?, ?)`,
      [facilityId, ownerName, email, phone, username, hashPassword(password), plan.code, plan.amount, plan.currency, isCompany ? 1 : 0, isCompany ? cui : null, isCompany ? billingAddress : null, crypto.createHash('sha256').update(claimToken).digest('hex')]
    )

    res.json({
      success: true,
      data: {
        claimId: result.insertId,
        facilityId,
        status: 'awaiting_payment',
        facility: { id: facility.id, name: facility.name, facilityType: facility.facility_type },
        plan,
        claimToken
      }
    })
  } catch (error) {
    console.error('Error creating claim:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

app.post('/api/facilities/:id/claim', (req, res) => createFacilityClaim(req, res))

async function claimTokenMatches(req) {
  const token = String(req.headers['x-claim-token'] || '')
  if (!token) return false
  const [rows] = await pool.query('SELECT claim_token_hash FROM facility_claims WHERE id = ?', [req.params.id])
  if (rows.length === 0 || !rows[0].claim_token_hash) return false
  const actual = crypto.createHash('sha256').update(token).digest('hex')
  const left = Buffer.from(rows[0].claim_token_hash)
  const right = Buffer.from(actual)
  return left.length === right.length && crypto.timingSafeEqual(left, right)
}

app.get('/api/claims/:id', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }
    if (!(await claimTokenMatches(req))) {
      return res.status(401).json({ success: false, error: 'Cheia revendicării lipsește sau nu este validă.' })
    }
    const [rows] = await pool.query(
      `SELECT c.id, c.facility_id, c.owner_name, c.email, c.phone, c.username, c.status,
              c.plan_code, c.amount, c.currency, c.payment_provider, c.payment_status, c.payment_reference,
              f.name AS facility_name, f.facility_type, f.city, f.is_verified
       FROM facility_claims c
       JOIN facilities f ON f.id = c.facility_id
       WHERE c.id = ?`,
      [req.params.id]
    )
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Revendicarea nu există.' })
    }
    res.json({
      success: true,
      data: {
        ...rows[0],
        plans: SUBSCRIPTION_PLANS,
        plan: getPlan(rows[0].plan_code),
        paymentMode: netopiaIsConfigured() ? 'netopia' : 'simulation'
      }
    })
  } catch (error) {
    console.error('Error fetching claim:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/claims/:id/pay', async (req, res) => {
  const connection = await pool.getConnection()
  try {
    if (!(await claimTokenMatches(req))) {
      return res.status(401).json({ success: false, error: 'Cheia revendicării lipsește sau nu este validă.' })
    }
    const allowSimulate = !netopiaIsConfigured() && process.env.NODE_ENV !== 'production'
    if (!allowSimulate) {
      return res.status(403).json({ success: false, error: 'Plata se confirmă doar prin procesatorul de plăți.' })
    }
    if (!req.body?.simulate) {
      return res.status(400).json({ success: false, error: 'Confirmă plata simulată.' })
    }

    await connection.beginTransaction()
    const [claims] = await connection.query('SELECT * FROM facility_claims WHERE id = ? FOR UPDATE', [req.params.id])
    if (claims.length === 0) {
      await connection.rollback()
      return res.status(404).json({ success: false, error: 'Revendicarea nu există.' })
    }
    const claim = claims[0]
    if (claim.status === 'completed') {
      await connection.rollback()
      return res.status(409).json({ success: false, error: 'Revendicarea este deja finalizată.' })
    }

    let userId = claim.user_id
    if (!userId) {
      const [existingUser] = await connection.query('SELECT id FROM users WHERE username = ?', [claim.username])
      if (existingUser.length > 0) {
        userId = existingUser[0].id
      } else {
        const [facilityRows] = await connection.query('SELECT facility_type FROM facilities WHERE id = ?', [claim.facility_id])
        const [userResult] = await connection.query(
          `INSERT INTO users (username, password, email, facility_id, facility_type) VALUES (?, ?, ?, ?, ?)`,
          [claim.username, claim.password_hash, claim.email, claim.facility_id, facilityRows[0].facility_type]
        )
        userId = userResult.insertId
      }
    }

    const plan = getPlan(req.body.planCode || claim.plan_code)
    const reference = claim.payment_reference || `SIM-${Date.now()}`
    await connection.query(
      `UPDATE facility_claims
       SET status = 'paid', payment_status = 'simulated', payment_reference = ?, user_id = ?,
           plan_code = ?, amount = ?, paid_at = COALESCE(paid_at, CURRENT_TIMESTAMP)
       WHERE id = ?`,
      [reference, userId, plan.code, plan.amount, claim.id]
    )
    await connection.query(
      `UPDATE facilities
       SET is_verified = 1,
           status = 'active',
           subscription_ends_at = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? MONTH)
       WHERE id = ?`,
      [subscriptionMonths(plan.code), claim.facility_id]
    )
    await connection.commit()

    res.json({
      success: true,
      message: 'Plata a fost simulată. Poți completa profilul.',
      data: {
        claimId: claim.id,
        status: 'paid',
        paymentReference: reference,
        paymentMode: 'simulation',
        token: signToken({ role: 'user', id: userId, username: claim.username, facilityId: claim.facility_id }, 14 * 24 * 60 * 60),
        user: {
          id: userId,
          username: claim.username,
          email: claim.email,
          facilityId: claim.facility_id
        }
      }
    })
  } catch (error) {
    await connection.rollback()
    console.error('Error simulating payment:', error)
    res.status(500).json({ success: false, error: error.message })
  } finally {
    connection.release()
  }
})

app.post('/api/claims/:id/onboarding', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'gallery', maxCount: 12 }
]), async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    const [claims] = await pool.query(
      `SELECT c.*, f.facility_type
       FROM facility_claims c
       JOIN facilities f ON f.id = c.facility_id
       WHERE c.id = ?`,
      [req.params.id]
    )
    if (claims.length === 0) {
      return res.status(404).json({ success: false, error: 'Revendicarea nu există.' })
    }
    const claim = claims[0]
    if (!(await claimTokenMatches(req))) {
      return res.status(401).json({ success: false, error: 'Cheia revendicării lipsește sau nu este validă.' })
    }
    const username = String(req.body.username || '').trim().toLowerCase()
    if (!username || username !== claim.username) {
      return res.status(403).json({ success: false, error: 'Revendicarea nu aparține acestui cont.' })
    }
    if (claim.status === 'awaiting_payment') {
      return res.status(402).json({ success: false, error: 'Abonamentul nu este plătit.' })
    }

    const parseMaybe = (value) => {
      if (typeof value !== 'string') return value
      const trimmed = value.trim()
      if (!trimmed || trimmed === 'null') return null
      try { return JSON.parse(trimmed) } catch { return value }
    }
    const text = (key) => {
      const value = req.body[key]
      if (value == null) return ''
      return String(value).trim()
    }
    const has = (key) => Object.prototype.hasOwnProperty.call(req.body, key)
    const flag = (key) => req.body[key] === 'true' || req.body[key] === true || req.body[key] === '1' || req.body[key] === 1
    const saveDataImage = (dataUrl, folder) => {
      if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image')) return null
      const buffer = Buffer.from(dataUrl.replace(/^data:image\/\w+;base64,/, ''), 'base64')
      if (!buffer.length || buffer.length > 8 * 1024 * 1024) return null
      const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.jpg`
      const dir = path.join(__dirname, 'uploads', folder)
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
      writeFileSync(path.join(dir, filename), buffer)
      return `/uploads/${folder}/${filename}`
    }

    const phones = parseMaybe(req.body.phones)
    const whatsapps = parseMaybe(req.body.whatsapps)
    const emails = parseMaybe(req.body.emails)
    const socialMedia = parseMaybe(req.body.socialMedia)
    const sportsFields = parseMaybe(req.body.sportsFields)
    const mapCoordinates = parseMaybe(req.body.mapCoordinates)
    const repairCategories = parseMaybe(req.body.repairCategories)
    const pricingDetails = parseMaybe(req.body.pricingDetails)
    const phoneList = Array.isArray(phones) ? phones.map((item) => String(item || '').trim()).filter(Boolean) : []
    const emailList = Array.isArray(emails) ? emails.map((item) => String(item || '').trim()).filter(Boolean) : []
    const whatsappList = Array.isArray(whatsapps) ? whatsapps.map((item) => String(item || '').trim()).filter(Boolean) : []
    const primaryPhone = text('phone') || phoneList[0] || ''
    const primaryEmail = text('email') || emailList[0] || ''
    const name = text('name') || text('facilityName')
    const city = text('city')
    const locationNotSpecified = flag('locationNotSpecified')
    const location = locationNotSpecified ? '' : text('location')
    const facilityType = claim.facility_type

    if (!name || !city || !primaryPhone || !primaryEmail || (!location && !locationNotSpecified)) {
      return res.status(400).json({ success: false, error: 'Completează denumirea, orașul, adresa, un telefon și un email.' })
    }
    if (facilityType === 'field' && (!Array.isArray(sportsFields) || sportsFields.length === 0)) {
      return res.status(400).json({ success: false, error: 'Adaugă cel puțin un teren cu program și preț.' })
    }
    if (facilityType === 'coach' && (!text('sport') || !text('specialization'))) {
      return res.status(400).json({ success: false, error: 'Completează sportul și specializarea.' })
    }
    if (facilityType === 'repair_shop' && (!Array.isArray(repairCategories) || repairCategories.length === 0)) {
      return res.status(400).json({ success: false, error: 'Alege cel puțin o categorie de reparații.' })
    }
    if (facilityType === 'equipment_shop' && !text('sport')) {
      return res.status(400).json({ success: false, error: 'Alege sportul magazinului.' })
    }

    let logoUrl = null
    if (req.files && req.files.logo && req.files.logo.length > 0) {
      logoUrl = `/uploads/logos/${req.files.logo[0].filename}`
    } else {
      logoUrl = saveDataImage(req.body.logoUrl || req.body.logo, 'logos')
    }

    let gallery = null
    if (req.files && req.files.gallery && req.files.gallery.length > 0) {
      gallery = req.files.gallery.map((file) => `/uploads/gallery/${file.filename}`)
    } else {
      const incoming = parseMaybe(req.body.gallery)
      if (Array.isArray(incoming) && incoming.length > 0) {
        gallery = incoming.map((item) => {
          if (typeof item === 'string' && item.startsWith('/uploads/')) return item
          return saveDataImage(item, 'gallery')
        }).filter(Boolean)
        if (gallery.length === 0) gallery = null
      }
    }

    const openingRaw = text('openingHours')
    const openingHours = !openingRaw || openingRaw === 'null' ? null : openingRaw
    const pricePerHour = text('pricePerHour') || text('price')
    const pricePerLesson = text('pricePerLesson')
    const firstFieldPrice = Array.isArray(sportsFields)
      ? sportsFields.flatMap((field) => Array.isArray(field.timeSlots) ? field.timeSlots : []).find((slot) => slot && slot.status === 'open' && slot.price)?.price
      : null
    const sets = [
      'name = ?',
      'city = ?',
      'county = ?',
      'location = ?',
      'location_not_specified = ?',
      'map_coordinates = ?',
      'phone = ?',
      'phones = ?',
      'whatsapp = ?',
      'whatsapps = ?',
      'email = ?',
      'emails = ?',
      'contact_person = ?',
      'description = ?',
      'website = ?',
      'opening_hours = ?',
      'social_media = ?',
      'is_verified = 1',
      "status = 'active'"
    ]
    const values = [
      name,
      city,
      text('county') || null,
      location || null,
      locationNotSpecified ? 1 : 0,
      mapCoordinates ? JSON.stringify(mapCoordinates) : null,
      primaryPhone,
      JSON.stringify(phoneList.length ? phoneList : [primaryPhone]),
      whatsappList[0] || text('whatsapp') || null,
      JSON.stringify(whatsappList),
      primaryEmail,
      JSON.stringify(emailList.length ? emailList : [primaryEmail]),
      text('contactPerson') || claim.owner_name,
      text('description') || null,
      text('website') || null,
      openingHours,
      socialMedia ? JSON.stringify(socialMedia) : null
    ]
    if (logoUrl) {
      sets.push('logo_url = ?')
      values.push(logoUrl)
    }
    if (gallery) {
      sets.push('gallery = ?')
      values.push(JSON.stringify(gallery))
    }
    if (facilityType === 'field' || facilityType === 'equipment_shop') {
      const sport = text('sport') || (Array.isArray(sportsFields) && sportsFields[0] ? sportsFields[0].sportType : '')
      sets.push('sport = ?')
      values.push(sport || null)
    }
    if (pricePerHour || firstFieldPrice) {
      sets.push('price_per_hour = ?')
      values.push(parseFloat(pricePerHour || firstFieldPrice))
    }
    if (pricePerLesson) {
      sets.push('price_per_lesson = ?')
      values.push(parseFloat(pricePerLesson))
    }
    if (has('pricingDetails')) {
      sets.push('pricing_details = ?')
      values.push(pricingDetails ? JSON.stringify(pricingDetails) : null)
    }
    for (const [key, column] of [
      ['hasParking', 'has_parking'],
      ['hasShower', 'has_shower'],
      ['hasChangingRoom', 'has_changing_room'],
      ['hasAirConditioning', 'has_air_conditioning'],
      ['hasLighting', 'has_lighting'],
      ['deliveryAvailable', 'delivery_available']
    ]) {
      if (has(key)) {
        sets.push(`${column} = ?`)
        values.push(flag(key) ? 1 : 0)
      }
    }
    for (const [key, column] of [
      ['specialization', 'specialization'],
      ['certifications', 'certifications'],
      ['languages', 'languages'],
      ['servicesOffered', 'services_offered'],
      ['brandsServiced', 'brands_serviced'],
      ['averageRepairTime', 'average_repair_time'],
      ['productsCategories', 'products_categories'],
      ['brandsAvailable', 'brands_available']
    ]) {
      if (has(key)) {
        sets.push(`${column} = ?`)
        values.push(text(key) || null)
      }
    }
    if (has('experienceYears')) {
      sets.push('experience_years = ?')
      values.push(text('experienceYears') ? parseInt(text('experienceYears'), 10) : null)
    }
    if (has('repairCategories')) {
      sets.push('repair_categories = ?')
      values.push(JSON.stringify(Array.isArray(repairCategories) ? repairCategories : []))
    }

    values.push(claim.facility_id)
    await pool.query(`UPDATE facilities SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values)

    if (facilityType === 'field' && Array.isArray(sportsFields)) {
      await pool.query('DELETE FROM facility_sports_fields WHERE facility_id = ?', [claim.facility_id])
      for (const field of sportsFields) {
        const legacyPrice = Array.isArray(field.timeSlots)
          ? field.timeSlots.find((slot) => slot && slot.status === 'open' && slot.price)?.price
          : null
        await pool.query(
          `INSERT INTO facility_sports_fields (facility_id, sport_type, field_name, price_per_hour, description, features, slot_size, time_slots)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            claim.facility_id,
            field.sportType || null,
            field.fieldName || null,
            legacyPrice ? parseFloat(legacyPrice) : null,
            field.description || null,
            JSON.stringify(field.features || {}),
            field.slotSize || 60,
            JSON.stringify(field.timeSlots || [])
          ]
        )
        if (field.sportType) {
          const sportName = String(field.sportType).trim().toLowerCase()
          const [existingSport] = await pool.query('SELECT id FROM pending_sports WHERE sport = ?', [sportName])
          if (existingSport.length === 0) {
            await pool.query('INSERT INTO pending_sports (sport, status) VALUES (?, ?)', [sportName, 'pending'])
          }
        }
      }
    }

    await pool.query('UPDATE users SET email = ? WHERE facility_id = ?', [primaryEmail, claim.facility_id])
    await pool.query(`UPDATE facility_claims SET status = 'completed' WHERE id = ?`, [claim.id])

    res.json({
      success: true,
      message: 'Profilul a fost actualizat și marcat ca verificat.',
      data: { facilityId: claim.facility_id, isVerified: true }
    })
  } catch (error) {
    console.error('Error completing claim onboarding:', error)
    res.status(500).json({ success: false, error: 'Nu am putut salva profilul.' })
  }
})

// ==================== PUBLIC ENDPOINTS ====================

// GET all sports with facility counts (including approved sports from pending_sports)
app.get('/api/sports', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    // Get sports from facility_sports_fields (new structure)
    const [facilitySports] = await pool.query(`
      SELECT 
        fsf.sport_type as sport,
        COUNT(DISTINCT fsf.facility_id) as facility_count
      FROM facility_sports_fields fsf
      INNER JOIN facilities f ON fsf.facility_id = f.id
      WHERE fsf.sport_type IS NOT NULL AND fsf.sport_type != '' AND f.status = 'active'
      GROUP BY fsf.sport_type
    `)

    // Also get sports from old facilities table (for backward compatibility)
    const [legacyFacilitySports] = await pool.query(`
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
    
    // Add legacy sports
    legacyFacilitySports.forEach((row) => {
      if (!sportMap.has(row.sport)) {
        sportMap.set(row.sport, row.facility_count)
      }
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
        county,
        COUNT(*) as facility_count
      FROM facilities
      WHERE city IS NOT NULL AND city != '' AND status = 'active'
      GROUP BY city, county
    `)

    // Get approved cities from pending_cities
    const [approvedCities] = await pool.query(`
      SELECT city, county, 0 as facility_count
      FROM pending_cities
      WHERE status = 'approved'
    `)
    
    console.log('Approved cities from pending_cities:', approvedCities)

    // Combine and deduplicate
    const cityMap = new Map()
    
    facilityCities.forEach((row) => {
      cityMap.set(row.city, { county: row.county, facility_count: row.facility_count })
    })
    
    approvedCities.forEach((row) => {
      if (!cityMap.has(row.city)) {
        cityMap.set(row.city, { county: row.county, facility_count: 0 })
      }
    })

    // Convert to array and sort
    const cities = Array.from(cityMap.entries()).map(([city, data]) => ({
      city,
      county: data.county || null,
      facility_count: data.facility_count
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
// Helper function to create SEO-friendly slug
function createSlug(name, city) {
  const text = `${name} ${city}`
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

app.get('/api/facilities/:slug', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    const slug = req.params.slug
    
    // Try to find by slug first (if it's a slug format: name-city)
    // Otherwise, treat it as ID for backward compatibility
    let facility = null
    let facilityId = null
    
    // Check if it's a numeric ID (backward compatibility)
    if (/^\d+$/.test(slug)) {
      const [rowsById] = await pool.query('SELECT * FROM facilities WHERE id = ?', [slug])
      if (rowsById.length > 0) {
        facility = rowsById[0]
        facilityId = facility.id
      }
    } else {
      // It's a slug, search by matching name and city
      // First try active facilities, then all facilities (for debugging/private access)
      // Explicitly select all columns including logo_url and gallery
      const [activeFacilities] = await pool.query('SELECT * FROM facilities WHERE status = ?', ['active'])
      
      for (const f of activeFacilities) {
        const facilitySlug = createSlug(f.name || '', f.city || '')
        console.log(`[SLUG] Checking: "${facilitySlug}" vs "${slug}" for facility ${f.id} (${f.name}, ${f.city})`)
        if (facilitySlug === slug) {
          facility = f
          facilityId = f.id
          break
        }
      }
      
      // If not found in active, try all facilities (for private access or pending facilities)
      if (!facility) {
        // Explicitly select all columns including logo_url and gallery
        const [allFacilities] = await pool.query('SELECT * FROM facilities')
        for (const f of allFacilities) {
          const facilitySlug = createSlug(f.name || '', f.city || '')
          console.log(`[SLUG] Checking all: "${facilitySlug}" vs "${slug}" for facility ${f.id} (${f.name}, ${f.city})`)
          if (facilitySlug === slug) {
            facility = f
            facilityId = f.id
            break
          }
        }
      }
    }

    if (!facility) {
      // Log for debugging
      console.log(`[SLUG] Facility not found for slug: "${slug}"`)
      const [allFacilities] = await pool.query('SELECT id, name, city, status FROM facilities LIMIT 10')
      console.log(`[SLUG] Sample facilities:`, allFacilities.map(f => ({
        id: f.id,
        name: f.name,
        city: f.city,
        status: f.status,
        slug: createSlug(f.name || '', f.city || '')
      })))
      return res.status(404).json({ success: false, error: 'Baza sportivă nu a fost găsită' })
    }

    // If it's a sports base, fetch associated sports fields
    if (facility.facility_type === 'field') {
      const [sportsFieldsRows] = await pool.query(
        'SELECT * FROM facility_sports_fields WHERE facility_id = ? ORDER BY created_at ASC',
        [facilityId]
      )
      
      // Parse and map sports fields to match frontend structure
      facility.sportsFields = sportsFieldsRows.map((row) => {
        const field = {
          id: row.id,
          fieldName: row.field_name || row.fieldName,
          sportType: row.sport_type || row.sportType,
          description: row.description || '',
          slotSize: row.slot_size || row.slotSize || 60,
          features: {},
          timeSlots: []
        }
        
        // Parse features JSON
        if (row.features) {
          try {
            field.features = typeof row.features === 'string' ? JSON.parse(row.features) : row.features
          } catch (e) {
            console.error('Error parsing features for field', row.id, ':', e)
            field.features = {}
          }
        }
        
        // Parse time_slots JSON
        if (row.time_slots) {
          try {
            field.timeSlots = typeof row.time_slots === 'string' ? JSON.parse(row.time_slots) : row.time_slots
          } catch (e) {
            console.error('Error parsing time_slots for field', row.id, ':', e)
            field.timeSlots = []
          }
        }
        
        return field
      })
      
      console.log(`[API] Facility ${facilityId} - sportsFields count:`, facility.sportsFields.length)
      if (facility.sportsFields.length > 0) {
        console.log(`[API] First field:`, {
          fieldName: facility.sportsFields[0].fieldName,
          sportType: facility.sportsFields[0].sportType,
          timeSlotsCount: facility.sportsFields[0].timeSlots?.length || 0
        })
      }
    }

    // Debug: Log logo_url and gallery before sending response
    console.log(`[API] Facility ${facilityId} (${facility.name}) - logo_url:`, facility.logo_url)
    console.log(`[API] Facility ${facilityId} (${facility.name}) - gallery:`, facility.gallery)
    console.log(`[API] Facility ${facilityId} (${facility.name}) - gallery type:`, typeof facility.gallery)
    console.log(`[API] Facility ${facilityId} (${facility.name}) - all keys:`, Object.keys(facility))

    // Ensure logo_url and gallery are included in response (even if null)
    if (!facility.hasOwnProperty('logo_url')) {
      console.warn(`[API] WARNING: Facility ${facilityId} missing logo_url property`)
    }
    if (!facility.hasOwnProperty('gallery')) {
      console.warn(`[API] WARNING: Facility ${facilityId} missing gallery property`)
    }

    attachProfileTier(facility)

    res.json({ success: true, data: facility })
  } catch (error) {
    console.error('Error fetching facility:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET facilities filtered by type, city, sport, repairCategory
app.get('/api/facilities', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    const { type, city, sport, status = 'active', repairCategory } = req.query

    // For sports bases (field type), we need to check both the sport column and facility_sports_fields table
    let query = ''
    const params = []

    if (sport && type === 'field') {
      // For sports bases, include facilities that have the sport in the sport column OR have fields with that sport type
      query = `SELECT DISTINCT f.* FROM facilities f
               LEFT JOIN facility_sports_fields fsf ON f.id = fsf.facility_id
               WHERE 1=1`
      
      if (type) {
        query += ' AND f.facility_type = ?'
        params.push(type)
      }

      if (city) {
        query += ' AND f.city = ?'
        params.push(city)
      }

      // Sport filter: either in sport column OR in facility_sports_fields
      query += ' AND (f.sport = ? OR fsf.sport_type = ?)'
      params.push(sport, sport)

      if (status) {
        query += ' AND f.status = ?'
        params.push(status)
      }

      query += ' ORDER BY (f.subscription_ends_at IS NOT NULL AND f.subscription_ends_at > NOW()) DESC, (f.is_verified = 1) DESC, f.created_at DESC'
    } else {
      // For other types, use the original query
      query = 'SELECT * FROM facilities WHERE 1=1'

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

      // Filter by repair category for repair shops
      if (repairCategory && type === 'repair_shop') {
        query += ' AND JSON_CONTAINS(repair_categories, ?)'
        params.push(JSON.stringify(repairCategory))
      }

      query += ' ORDER BY (subscription_ends_at IS NOT NULL AND subscription_ends_at > NOW()) DESC, (is_verified = 1) DESC, created_at DESC'
    }

    console.log('[API /facilities] Query:', query)
    console.log('[API /facilities] Params:', params)
    
    const [rows] = await pool.query(query, params)
    console.log('[API /facilities] Results count:', rows.length)
    if (rows.length > 0) {
      console.log('[API /facilities] First result facility_type:', rows[0].facility_type)
    }

    // For sports bases, fetch associated sports fields and parse gallery
    const facilitiesWithDetails = await Promise.all(rows.map(async (facility) => {
      attachProfileTier(facility)
      if (facility.facility_type === 'field') {
        const [sportsFieldsRows] = await pool.query(
          'SELECT * FROM facility_sports_fields WHERE facility_id = ? ORDER BY created_at ASC',
          [facility.id]
        )
        
        // Parse and map sports fields to match frontend structure
        facility.sportsFields = sportsFieldsRows.map((row) => {
          const field = {
            id: row.id,
            fieldName: row.field_name || row.fieldName,
            sportType: row.sport_type || row.sportType,
            description: row.description || '',
            slotSize: row.slot_size || row.slotSize || 60,
            features: {},
            timeSlots: []
          }
          
          // Parse features JSON
          if (row.features) {
            try {
              field.features = typeof row.features === 'string' ? JSON.parse(row.features) : row.features
            } catch (e) {
              console.error('Error parsing features for field', row.id, ':', e)
              field.features = {}
            }
          }
          
          // Parse time_slots JSON
          if (row.time_slots) {
            try {
              field.timeSlots = typeof row.time_slots === 'string' ? JSON.parse(row.time_slots) : row.time_slots
            } catch (e) {
              console.error('Error parsing time_slots for field', row.id, ':', e)
              field.timeSlots = []
            }
          }
          
          return field
        })
      }
      
      // Parse gallery if it's a string
      if (facility.gallery && typeof facility.gallery === 'string') {
        try {
          facility.gallery = JSON.parse(facility.gallery)
        } catch (e) {
          facility.gallery = []
        }
      }
      
      return facility
    }))

    res.json({ success: true, data: facilitiesWithDetails })
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

    if (!rateLimit(req, res, 'admin-login', 8, 15 * 60 * 1000)) return
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
      token: signToken({ role: 'admin', id: rows[0].id, username: rows[0].username }, 12 * 60 * 60),
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

    // Check admin authentication
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Neautorizat' })
    }

    const type = req.query.type // Optional filter by facility type

    let query = `SELECT f.*, u.username, u.email as user_email
       FROM facilities f
       LEFT JOIN users u ON f.id = u.facility_id AND f.facility_type = u.facility_type
       WHERE f.status = 'pending'`
    
    const params = []
    
    if (type) {
      query += ' AND f.facility_type = ?'
      params.push(type)
    }
    
    query += ' ORDER BY f.created_at DESC'

    console.log(`[ADMIN] Fetching pending facilities${type ? ` (type: ${type})` : ''}`)
    const [rows] = await pool.query(query, params)
    console.log(`[ADMIN] Found ${rows.length} pending facilities`)

    res.json({ success: true, data: rows })
  } catch (error) {
    console.error('❌ Error fetching pending facilities:', error)
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
      'SELECT city, county, sport FROM facilities WHERE id = ?',
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
              'INSERT INTO pending_cities (city, county, status) VALUES (?, ?, ?)',
              [facility.city, facility.county || null, 'approved']
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
      if (String(row.setting_key).startsWith('smtp_')) return
      settings[row.setting_key] = row.setting_value
    })

    res.json({ success: true, data: settings })
  } catch (error) {
    console.error('Error fetching site settings:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// PUT update site setting by key
app.put('/api/admin/site-settings/:key', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    // Check admin authentication
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Neautorizat' })
    }

    const settingKey = req.params.key
    const { setting_value } = req.body

    if (!setting_value) {
      return res.status(400).json({
        success: false,
        error: 'Valoarea setării este obligatorie'
      })
    }

    await pool.query(
      `INSERT INTO site_settings (setting_key, setting_value) 
       VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = CURRENT_TIMESTAMP`,
      [settingKey, setting_value, setting_value]
    )

    res.json({
      success: true,
      message: `Setarea "${settingKey}" a fost actualizată cu succes`
    })
  } catch (error) {
    console.error('Error updating site setting:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET SMTP configuration
app.get('/api/admin/smtp-config', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    // Check admin authentication
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Neautorizat' })
    }

    const [rows] = await pool.query(
      'SELECT setting_key, setting_value FROM site_settings WHERE setting_key LIKE "smtp_%"'
    )
    
    const config = {}
    rows.forEach((row) => {
      const key = row.setting_key.replace('smtp_', '')
      if (key === 'password') {
        config.passwordSet = Boolean(row.setting_value)
        config.password = ''
      } else {
        config[key] = row.setting_value || ''
      }
    })
    
    res.json({ success: true, data: config })
  } catch (error) {
    console.error('Error fetching SMTP config:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// PUT update SMTP configuration
app.put('/api/admin/smtp-config', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    // Check admin authentication
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Neautorizat' })
    }

    const { host, port, secure, user, from } = req.body
    let { password } = req.body

    if (!password) {
      const [existing] = await pool.query('SELECT setting_value FROM site_settings WHERE setting_key = ?', ['smtp_password'])
      password = existing[0]?.setting_value || ''
    }

    if (!host || !port || !user || !password) {
      return res.status(400).json({
        success: false,
        error: 'Host, port, user și password sunt obligatorii'
      })
    }

    // Save SMTP settings
    const settings = [
      { key: 'smtp_host', value: String(host) },
      { key: 'smtp_port', value: String(port) },
      { key: 'smtp_secure', value: secure ? 'true' : 'false' },
      { key: 'smtp_user', value: String(user) },
      { key: 'smtp_password', value: String(password) },
      { key: 'smtp_from', value: String(from || user) }
    ]

    for (const setting of settings) {
      await pool.query(
        `INSERT INTO site_settings (setting_key, setting_value) 
         VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = CURRENT_TIMESTAMP`,
        [setting.key, setting.value, setting.value]
      )
    }

    res.json({
      success: true,
      message: 'Configurația SMTP a fost salvată cu succes'
    })
  } catch (error) {
    console.error('Error updating SMTP config:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// POST test SMTP configuration
app.post('/api/admin/smtp-test', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    // Check admin authentication
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Neautorizat' })
    }

    const { testEmail } = req.body
    if (!testEmail) {
      return res.status(400).json({
        success: false,
        error: 'Email-ul de test este obligatoriu'
      })
    }

    const smtpConfig = await getSMTPConfig()
    if (!smtpConfig) {
      return res.status(400).json({
        success: false,
        error: 'SMTP nu este configurat'
      })
    }

    const result = await sendEmail(
      testEmail,
      'Test Email - Sportisia',
      '<h2>Test Email</h2><p>Acesta este un email de test pentru configurația SMTP.</p><p>Dacă primești acest email, configurația SMTP funcționează corect!</p>'
    )

    if (result.success) {
      res.json({
        success: true,
        message: 'Email de test trimis cu succes! Verifică inbox-ul.'
      })
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Eroare la trimiterea email-ului de test'
      })
    }
  } catch (error) {
    console.error('Error testing SMTP:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// PUT update site logo (kept for backward compatibility)
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
    if (!rateLimit(req, res, 'pending-city', 10, 60 * 60 * 1000)) return
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
    if (!rateLimit(req, res, 'pending-sport', 10, 60 * 60 * 1000)) return
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

// SEO Pages endpoints
// GET SEO page by URL
app.get('/api/seo-pages', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    const { url } = req.query
    if (!url) {
      return res.status(400).json({ success: false, error: 'URL parameter is required' })
    }

    const [rows] = await pool.query(
      'SELECT * FROM seo_pages WHERE url = ?',
      [url]
    )

    if (rows.length === 0) {
      return res.json({ success: true, data: null })
    }

    res.json({ success: true, data: rows[0] })
  } catch (error) {
    console.error('Error fetching SEO page:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET all SEO pages (admin only)
app.get('/api/admin/seo-pages', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    // Check admin authentication
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const [rows] = await pool.query(
      'SELECT * FROM seo_pages ORDER BY url ASC'
    )

    res.json({ success: true, data: rows })
  } catch (error) {
    console.error('Error fetching SEO pages:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET single SEO page by ID (admin only)
app.get('/api/admin/seo-pages/:id', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    // Check admin authentication
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const { id } = req.params
    const [rows] = await pool.query(
      'SELECT * FROM seo_pages WHERE id = ?',
      [id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'SEO page not found' })
    }

    res.json({ success: true, data: rows[0] })
  } catch (error) {
    console.error('Error fetching SEO page:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// POST create SEO page (admin only)
app.post('/api/admin/seo-pages', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    // Check admin authentication
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const { url, meta_title, meta_description, h1_title, description } = req.body

    if (!url) {
      return res.status(400).json({ success: false, error: 'URL is required' })
    }

    await pool.query(
      'INSERT INTO seo_pages (url, meta_title, meta_description, h1_title, description) VALUES (?, ?, ?, ?, ?)',
      [url, meta_title || null, meta_description || null, h1_title || null, description || null]
    )

    res.json({ success: true, message: 'SEO page created successfully' })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, error: 'URL already exists' })
    }
    console.error('Error creating SEO page:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// PUT update SEO page (admin only)
app.put('/api/admin/seo-pages/:id', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    // Check admin authentication
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const { id } = req.params
    const { meta_title, meta_description, h1_title, description } = req.body

    await pool.query(
      'UPDATE seo_pages SET meta_title = ?, meta_description = ?, h1_title = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [meta_title || null, meta_description || null, h1_title || null, description || null, id]
    )

    res.json({ success: true, message: 'SEO page updated successfully' })
  } catch (error) {
    console.error('Error updating SEO page:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// DELETE SEO page (admin only)
// POST facility suggestion
app.post('/api/suggestions', async (req, res) => {
  try {
    if (!rateLimit(req, res, 'suggestion', 10, 60 * 60 * 1000)) return
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    const { name, county, city, address } = req.body

    if (!name || !county || !city || !address) {
      return res.status(400).json({
        success: false,
        error: 'Toate câmpurile sunt obligatorii'
      })
    }

    await pool.query(
      'INSERT INTO facility_suggestions (name, county, city, address, status) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), county, city.trim(), address.trim(), 'pending']
    )

    res.json({
      success: true,
      message: 'Sugestia a fost trimisă cu succes'
    })
  } catch (error) {
    console.error('Error saving suggestion:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET all suggestions (admin only)
app.get('/api/admin/suggestions', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    // Check admin authentication
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const { status } = req.query
    let query = 'SELECT * FROM facility_suggestions'
    const params = []

    if (status) {
      query += ' WHERE status = ?'
      params.push(status)
    }

    query += ' ORDER BY created_at DESC'

    const [rows] = await pool.query(query, params)

    res.json({ success: true, data: rows })
  } catch (error) {
    console.error('Error fetching suggestions:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// PUT update suggestion status (admin only)
app.put('/api/admin/suggestions/:id/status', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    // Check admin authentication
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const { id } = req.params
    const { status } = req.body

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status invalid'
      })
    }

    await pool.query(
      'UPDATE facility_suggestions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    )

    res.json({ success: true, message: 'Status actualizat cu succes' })
  } catch (error) {
    console.error('Error updating suggestion status:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// DELETE suggestion (admin only)
app.delete('/api/admin/suggestions/:id', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    // Check admin authentication
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const { id } = req.params
    await pool.query('DELETE FROM facility_suggestions WHERE id = ?', [id])

    res.json({ success: true, message: 'Sugestie ștearsă cu succes' })
  } catch (error) {
    console.error('Error deleting suggestion:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

app.delete('/api/admin/seo-pages/:id', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, error: 'Database not initialized' })
    }

    // Check admin authentication
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const { id } = req.params
    await pool.query('DELETE FROM seo_pages WHERE id = ?', [id])

    res.json({ success: true, message: 'SEO page deleted successfully' })
  } catch (error) {
    console.error('Error deleting SEO page:', error)
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
