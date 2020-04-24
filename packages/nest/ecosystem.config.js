module.exports = {
  apps: [
    {
      name: 'minichat-1',
      script: './dist/src/main.js',
      watch: true,
      exec_mode: 'fork',
      autorestart: false,
      env: {
        NODE_ENV: 'production',
        PORT: 4211,
      },
    },
    {
      name: 'minichat-2',
      script: './dist/src/main.js',
      watch: true,
      exec_mode: 'fork',
      autorestart: false,
      env: {
        NODE_ENV: 'production',
        PORT: 4212,
      },
    },
  ],
};
