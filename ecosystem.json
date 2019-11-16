module.exports = {
  apps : [{
    name: 'portal',
    script: './bin/www',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    instances: 1,
    autorestart: true,
    watch: true,
    ignore_watch : ['node_modules', 'Logs', 'Downloads', '.git'],
    error_file: '/home/fdm/portal.atheios.org/Logs/error.log',
    out_file: '/home/fdm/portal.atheios.org/Logs/out.log',
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};