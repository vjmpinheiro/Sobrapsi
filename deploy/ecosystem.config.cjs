/** @type {import('pm2').StartOptions} */
module.exports = {
  apps: [
    {
      name: "sobrapsi",
      script: "npm",
      args: "start",
      cwd: "/var/www/sobrapsi",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "development",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
