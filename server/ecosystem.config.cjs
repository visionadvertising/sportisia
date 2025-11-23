require('dotenv').config({ path: require('path').join(__dirname, '.env') })

module.exports = {
  apps: [{
    name: 'sportisiaro-api',
    script: './server/index.js',
    cwd: require('path').join(__dirname, '..'),
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 3001,
      DATABASE_URL: process.env.DATABASE_URL,
      FRONTEND_URL: process.env.FRONTEND_URL || '*',
      NODE_PORT: process.env.NODE_PORT || 3001
    },
    error_file: '/root/.pm2/logs/sportisiaro-api-error.log',
    out_file: '/root/.pm2/logs/sportisiaro-api-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}

