const pkg = require('./package.json');
const path = require('path');

module.exports = {
  frontendCRDPath: path.resolve(__dirname, './deploy/frontend.yml'),
  appUrl: pkg.insights.appUrl,
  debug: true,
  useProxy: true,
  proxyVerbose: true,
  /**
   * Change to false after your app is registered in configuration files
   */
  interceptChromeConfig: false,
  /**
   * Add additional webpack plugins
   */
  plugins: [],
  _unstableHotReload: process.env.HOT === 'true',
  moduleFederation: {
    exclude: ['react-router-dom'],
    shared: [
      {
        'react-router-dom': {
          singleton: true,
          import: false,
          version: '^6.3.0',
        },
      },
    ],
  },
  routes: {
    ...(process.env.REMOTE_CONFIG && {
      '/api/chrome-service/v1/static': {
        host: `http://localhost:${
          isNaN(Number(process.env.REMOTE_CONFIG))
            ? 8080
            : process.env.REMOTE_CONFIG
        }`,
      },
    }),
  },
};
