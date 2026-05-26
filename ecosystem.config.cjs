module.exports = {
  apps: [
    {
      name: 'holiday-api',
      script: 'apps/api/dist/server.js',
      cwd: './',
      env: {
        NODE_ENV: 'development',
        APP_PORT: 3011
      }
    },
    {
      name: 'holiday-web',
      script: 'npm',
      args: 'run dev --workspace apps/web -- --port 5172',
      cwd: './',
      env: {
        NODE_ENV: 'development'
      }
    }
  ]
};
