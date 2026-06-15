module.exports = {
  apps: [
    {
      name: 'hosxp-holiday-api',
      script: 'apps/api/dist/server.js',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      env_development: {
        NODE_ENV: 'development',
        APP_ENV: 'development',
        APP_PORT: 3011
      },
      env_production: {
        NODE_ENV: 'production',
        APP_ENV: 'production',
        APP_PORT: 3011
      }
    },
    {
      name: 'holiday-web',
      script: 'npm',
      args: 'run dev --workspace apps/web -- --port 5172',
      cwd: './',
      env_development: {
        NODE_ENV: 'development'
      }
    }
  ]
};
