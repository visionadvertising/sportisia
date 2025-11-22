import express from 'express'
import mysql from 'mysql2/promise'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'

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
    const dbUrl = process.env.DATABASE_URL || 'mysql://u328389087_sportisia:Csl19920903@localhost:3306/u328389087_sportisia'
    
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

    // Create table if not exists
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

    console.log('✅ Table created or already exists')
  } catch (error) {
    console.error('❌ Database initialization error:', error)
    // Nu aruncă eroarea, lasă serverul să pornească chiar dacă DB nu funcționează
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

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ success: false, error: 'Internal server error' })
})

// Start server
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
