import path from 'path';
import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpackConfig from '../webpack/webpack.config';

const config = require(path.join(__dirname, `../app/config.dev`)); //${process.env.NODE_ENV}`));

const app = express(); // Create the server application
const compiler = webpack(webpackConfig); // Initiate webpack with configuration

// Apply webpack-dev-middleware to the application in order to setup a dev server
app.use(webpackDevMiddleware(compiler, {
	publicPath: webpackConfig.output.publicPath,
	stats: {
		colors: true
	}
}));

// Apply webpack-hot-middleware to the application in order to enable hot reloading
app.use(webpackHotMiddleware(compiler));

// Specify the path used by the application to serve static files
app.use(webpackConfig.output.publicPath, express.static(webpackConfig.output.path));

// Any request will be handled by index.html which includes the routing logic contained in bundle.js
app.get('*', function(req, res) {
	res.sendFile(path.join(__dirname, '../../src/index.html'));
});

app.listen(config.port, config.host, function(err) {
	if (err) {
		console.log(err);
		return;
	}
	console.log(`Listening on http://${config.host}:${config.port}. Navigate to URL to view application.`);
});

module.exports = app;
