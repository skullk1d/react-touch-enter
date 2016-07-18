var WebpackConfig = require('webpack-config');

WebpackConfig.environment.setAll({
	env: function() {
		return 'dev'; //process.env.WEBPACK_ENV || process.env.NODE_ENV;
	}
});

module.exports = new WebpackConfig().extend('./conf/webpack/webpack.[env].config.js');
