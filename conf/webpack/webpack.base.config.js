var path = require('path');
var WebpackConfig = require('webpack-config');
var bourbonPaths = require('node-bourbon').includePaths;

module.exports = new WebpackConfig().merge({
	output: {
		path: path.join(__dirname, '../../build/'),
		publicPath: '/build/',
		filename: 'bundle.js'
	},
	module: {
		loaders: [
			{
				test: /\.scss$/,
				loaders: ['style', 'css', 'sass']
			},
			{
				test: /\.(png|woff|woff2|eot|ttf|svg)$/,
				loader: 'url-loader?limit=100000'
			}
		]
	},
	sassLoader: {
		includePaths: bourbonPaths
	},
	resolve: {
		alias: {
			config: path.join(__dirname, '../app', `config.dev`)//${process.env.NODE_ENV}`)
		},
		extensions: ['', '.js', '.jsx']
	}
});
