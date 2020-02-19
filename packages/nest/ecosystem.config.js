module.exports = {
  apps: [
    {
      name: 'minichat',
      script: './nest/main.js',
      watch: true,
      env: {
        NODE_ENV: 'production',
        PORT: 4211,
      },
    },
  ],
};
