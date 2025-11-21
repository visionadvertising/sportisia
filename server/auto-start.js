// Script pentru a porni backend-ul automat
// Rulează la fiecare deploy sau restart

import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('Auto-start script running...')

// Verifică dacă PM2 este disponibil
const checkPM2 = () => {
  return new Promise((resolve) => {
    const pm2Check = spawn('pm2', ['--version'], { stdio: 'pipe' })
    pm2Check.on('close', (code) => {
      resolve(code === 0)
    })
    pm2Check.on('error', () => {
      resolve(false)
    })
  })
}

// Pornește backend-ul
const startBackend = async () => {
  try {
    const hasPM2 = await checkPM2()
    
    if (hasPM2) {
      console.log('PM2 found, starting with PM2...')
      const pm2 = spawn('pm2', ['start', 'index.js', '--name', 'sportisiaro-api'], {
        cwd: __dirname,
        stdio: 'inherit'
      })
      pm2.on('close', (code) => {
        if (code === 0) {
          console.log('Backend started with PM2')
          spawn('pm2', ['save'], { cwd: __dirname, stdio: 'inherit' })
        }
      })
    } else {
      console.log('PM2 not found, starting directly...')
      const node = spawn('node', ['index.js'], {
        cwd: __dirname,
        stdio: 'inherit'
      })
      node.on('error', (err) => {
        console.error('Error starting backend:', err)
      })
    }
  } catch (error) {
    console.error('Error in auto-start:', error)
  }
}

startBackend()

