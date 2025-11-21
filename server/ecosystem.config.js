// PM2 configuration file
module.exports = {
  apps: [{
    name: 'sportisiaro-api',
    script: 'index.js',
    cwd: '/home/u328389087/domains/papayawhip-narwhal-717195.hostingersite.com/public_html/server',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      DATABASE_URL: 'mysql://u328389087_sportisia:Csl19920903@localhost:3306/u328389087_sportisia'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}

