module.exports = {
  devServer: {
    port: 4210,
    proxy: {
      '^/socket.io': {
        target: 'http://localhost:3000',
        // target: 'http://minichat.krist7599555.ml',
        ws: true
      },
      '^/api': {
        target: 'http://localhost:3000',
        ws: false
      }
    }
  },

  chainWebpack: config => {
    config.plugin('html').tap(args => {
      args[0].title = 'Minichat';
      args[0].meta = {
        viewport: 'width=device-width,initial-scale=1,user-scalable=no',
        'og:title': 'Minichat',
        'og:type': 'realtime web application',
        'og:url': 'https://minichat.krist7599555.ml', // here it is just ngrok for my te,
        'og:description': 'realtime chat websocket in pink theme',
        'og:image': 'https://minichat.krist7599555.ml/screenshot/1.png',
        'og:image:width': '1000'
      };

      return args;
    });
  },

  assetsDir: 'static',
  runtimeCompiler: true,

  pwa: {
    name: 'Minichat',
    themeColor: '#E66ED2'
  }
};
