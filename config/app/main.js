/* jshint esversion: 6 */
const cfg = require('./config');

module.exports = {
	name: cfg.appName,
	dbname: cfg.appName,
	domain: cfg.appURL,
	port: cfg.port,

	dev: {
		url: `http://localhost:${cfg.port}`,
	},

	production: {
		url: '',
	},

	getENV() {
		return process.env.NODE_ENV == 'production' ? this.production : this.dev;
	},
};
