module.exports = {
  apps: [
    {
      name: 'minichat',
      script: './src/main.js',
      watch: true,
      env: {
        NODE_ENV: 'production',
        PORT: 4211,
      },
    },
  ],
};
