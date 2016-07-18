var path = require('path');
var webpack = require('webpack');
var WebpackConfig = require('webpack-config');

module.exports = new WebpackConfig().extend('./conf/webpack/webpack.base.config.js').merge({
	entry: {
		app: [
			'webpack-hot-middleware/client?reload=true',
			path.join(__dirname, '../../src/index')
		]
	},
	devtool: 'source-map',
	module: {
		preLoaders: [
			{
				test: /\.js(x)?$/,
				exclude: /node_modules/,
				loader: 'eslint-loader'
			}
		],
		loaders: [
			{
				test: /\.js(x)?$/,
				exclude: /node_modules/,
				loader: 'react-hot'
			},
			{
				test: /\.js(x)?$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				query: {
					presets: ['es2015', 'react'],
					plugins: ['transform-object-rest-spread']
				}
			}
		]
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoErrorsPlugin()
	],
	eslint: {
		configFile: './.eslintrc.json'
	}
});
