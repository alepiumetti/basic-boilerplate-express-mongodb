/* jshint esversion: 6 */
const {
	//query,
	get,
	create,
	update,
	remove,
	auth,
} = require('../controllers/usuarios');

const { rateLimiter, isAdmin } = require('../middlewares/app');

const { jwtAuth } = require('../middlewares/auth.middleware');

module.exports = (application) => {
	application
		.route('/endpoint/usuarios')
		.get(rateLimiter, jwtAuth, isAdmin, get)
		.post(rateLimiter, jwtAuth, isAdmin, create)
		.put(rateLimiter, jwtAuth, isAdmin, update)
		.delete(rateLimiter, jwtAuth, isAdmin, remove);

	application.route('/endpoint/usuarios/auth').post(rateLimiter, auth);

	/*application
  .route('/endpoint/me/profile')
  .put(rateLimiter, requireLogin, updateProfile)

  application
  .route('/endpoint/me/password')
  .put(rateLimiter, requireLogin, updatePassword)*/
};
