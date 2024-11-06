/* jshint esversion: 6 */

// modules
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// models
const usuarios = mongoose.model('usuarios');

const createJwt = require('../utils/createJwt');

// controllers
exports.get = async (req, res) => {
	const { id } = req.query;

	let query = {
		eliminado: false,
	};

	if (!!id) {
		query._id = id;
	}

	let recordset = [];

	try {
		recordset = await usuarios.find(query).lean().exec();
	} catch (ex) {
		console.log('[_get() ex] ', ex);
		return res.failure(-1, 'Error listando usuarios', 500);
	}

	return res.success(recordset, 200);
};

exports.create = async (req, res) => {
	const { username, email, password } = req.body;

	if (!username) {
		return res.failure(-1, 'Debe especificar un nombre de usuario', 400);
	} else if (!email) {
		return res.failure(-1, 'Debe especificar un correo electrónico', 400);
	} else if (!password) {
		return res.failure(-1, 'La contraseña no puede estar vacía', 400);
	}

	// verifico que no exista
	try {
		const query = {
			eliminado: false,
			$or: [{ username }, { email }],
		};

		const existente = await usuarios.findOne(query).lean();

		if (!!existente) {
			return res.failure(
				-1,
				'El nombre de usuario y/o email ya estan en uso',
				400
			);
		}
	} catch (ex) {
		console.log('[_create() existente ex] ', ex);
		return res.failure(-1, 'Error Interno', 500);
	}

	try {
		await new usuarios({
			createdAt: new Date(),
			eliminado: false,
			password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null),
			username,
			email,
		}).save();
	} catch (ex) {
		console.log('[_create() update() ex] ', ex);
		return res.failure(-1, 'Error creando usuario', 400);
	}

	return res.success(true, 200);
};

exports.update = async (req, res) => {
	const { id, username, email, password } = req.body;

	if (!username) {
		return res.failure(-1, 'Debe especificar un nombre de usuario', 400);
	} else if (!email) {
		return res.failure(-1, 'Debe especificar un correo electrónico', 400);
	}

	// verifico que no exista
	try {
		const query = {
			$and: [
				{ $or: [{ username }, { email }] },

				{
					_id: {
						$ne: id,
					},
				},

				{ eliminado: false },
			],
		};

		const existente = await usuarios.findOne(query).lean();

		console.log(id, username, email, existente);

		if (!!existente) {
			return res.failure(
				-1,
				'El nombre de usuario y/o email ya estan en uso',
				400
			);
		}
	} catch (ex) {
		console.log('[_update() existente ex] ', ex);
		return res.failure(-1, 'Error Interno', 500);
	}

	try {
		const query = {
			_id: id,
		};

		let update = {
			username,
			email,
		};

		if (!!password) {
			//update.$set.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
			update.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
		}

		await usuarios.updateOne(query, update);
	} catch (ex) {
		console.log('[_update() update() ex] ', ex);
		return res.failure(-1, 'Error actualizando cliente', 400);
	}

	return res.success(true, 200);
};

exports.remove = async (req, res) => {
	const { id } = req.body;

	if (!id) {
		return res.failure(-1, 'Usuario no identificado', 400);
	}

	try {
		const query = { _id: id };
		const update = { eliminado: true };

		await usuarios.updateOne(query, update);
	} catch (ex) {
		console.log('[_delete() update() ex] ', ex);
		return res.failure(-1, 'Error eliminando usuario', 400);
	}

	return res.success(true, 200);
};

exports.auth = async (req, res) => {
	const { email, password } = req.body;

	const query = {
		eliminado: false,
		$or: [{ email }, { username: email }],
	};

	let usuario = null;

	try {
		usuario = await usuarios.findOne(query).lean();
	} catch (ex) {
		console.log('[auth() usuarios ex] ', ex);
		return res.failure(-1, 'Error Interno', 500);
	}

	if (!usuario) {
		return res.failure(-1, 'Credenciales no válidas', 200); // 401)
	}

	if (!bcrypt.compareSync(password, usuario.password)) {
		return res.failure(-1, 'Credenciales no válidas', 200); // 401)
	}

	return res.success(
		{
			_id: usuario._id,
			username: usuario.username,
			email: usuario.email,
			cliente: usuario.cliente,
			jwt: createJwt(usuario),
		},
		200
	);
};
