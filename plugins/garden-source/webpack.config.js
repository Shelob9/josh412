const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

module.exports = {
    ...defaultConfig,
    devServer: {
        proxy: [
          {
            context: ['/search'],
            target: 'http://localhost:5050',
          },
        ],
      },
};
