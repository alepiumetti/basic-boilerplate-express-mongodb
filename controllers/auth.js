/* jshint esversion: 6 */

// Modules
const passport = require("passport");

/**
 * Inicio de Sesión
 */
exports.login = (req, res, next) => {
	passport.authenticate("local-login", (err, user) => {
		if (!!err) {
			return next(err);
		}

		if (!user) {
			return res.failure(-1, "Credenciales incorrectas", 500);
		}

		req.logIn(user, (err) => {
			if (!!err) {
				return next(err);
			}

			user.password = "";
			return res.success(
				{
					//redirect: '/dashboard',
					user,
				},
				200
			);
		});
	})(req, res, next);
};

/**
 * Cerrar de Sesión
 */
exports.logout = (req, res) => {
	req.logout();
	return res.success({}, 200);
};
