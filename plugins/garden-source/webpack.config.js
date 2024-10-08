const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

module.exports = {
    ...defaultConfig,

      entry: {
        index: './src/index.js',
        sidebar: './src/sidebar.js',
        dashboard: './src/dashboard.tsx',
      },
};
