/* jshint esversion: 6 */

// require
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// cfg
const { cfg } = require("../app/config");

// require models
require("../../models/index")();

// Models
const usuarios = mongoose.model("usuarios");

// variables
mongoose.Promise = Promise;

// connect database
exports.connectMongo = async () => {
	const url = cfg.dbURI;
	const opt = {
		useNewUrlParser: true,
		useFindAndModify: false,
	};

	try {
		await mongoose.connect(url, opt);

		console.log("[+] Connected to MongoDB");
		console.log(`[+] DB: ${cfg.appName}`);

		// Crea el usuario administrador de sistema
		const filter = { creationMethod: process.env.ADMIN_CREATIONMETHOD };
		const usuario = await usuarios.findOne(filter).exec();

		if (!usuario) {
			const adminUser = {
				createdAt: new Date(),
				username: process.env.ADMIN_USER,
				password: bcrypt.hashSync(
					process.env.ADMIN_PASSWORD,
					bcrypt.genSaltSync(10),
					null
				),
				email: process.env.ADMIN_EMAIL,
				creationMethod: process.env.ADMIN_CREATIONMETHOD,
				rol: process.env.ADMIN_ROL,
				eliminado: false,
			};
			await new usuarios(adminUser).save();

			console.log("");
			console.log("==============================");
			console.log("Usuario Admin creado");
			console.log(`Usuario: ${adminUser.username}`);
			console.log(`Email: ${adminUser.email}`);
			console.log("==============================");
			console.log("");
		} else if (!!usuario) {
			// Si el usuario esta creado pero eliminado
			// Lo vuelvo a habilitar
			if (usuario.eliminado === true) {
				usuario.eliminado = false;
				await usuario.save();
			}
		}

		//TODO: Agregar inicialización de documentos por default bases de datos
	} catch (ex) {
		console.log(`\n[+] MongoDB exception ${ex}`);
		console.log("Reconnecting in 5 seconds...");
		return setTimeout(connectMongo, 5000);
	}
};
