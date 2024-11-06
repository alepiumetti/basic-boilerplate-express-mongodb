/* jshint esversion: 6 */
const mongoose = require('mongoose');

const usuariosSchema = mongoose.Schema(
	{
		// SYSTEM USAGE
		created: {
			at: {
				type: Date,
				default: Date.now,
			},
			by: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'usuarios',
			},
		},
		updated: {
			at: Date,
			by: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'usuarios',
			},
		},
		eliminado: {
			type: Boolean,
			default: false,
		},

		// CORE APP
		username: {
			type: String,
			trim: true,
		},
		email: {
			type: String,
			trim: true,
			lowercase: true,
			match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
		},
		password: String,
		creationMethod: String,
	},
	{
		collection: 'usuarios',
	}
);

module.exports = mongoose.model('usuarios', usuariosSchema);
