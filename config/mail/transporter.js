const nodemailer = require('nodemailer');

const trasnporter = nodemailer.createTransport({
	host: '',
	port: 0,
	secure: true,
	auth: {
		user: '',
		pass: '',
	},
});

module.exports = trasnporter;
