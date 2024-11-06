/* jshint esversion: 6 */
const RateLimiter = require('limiter').RateLimiter;
const limiter = new RateLimiter(10, 'second', true);

module.exports = {
	/**
	 * Chequea si el usuario logueado es admin
	 */
	isAdmin(req, res, next) {
		console.log('isAdmin', req.user);
		if (!req.isAuthenticated()) {
			if (req.method == 'GET') {
				return res.failure(-1, 'Unauthorized', 403);
			} else if (req.method == 'POST') {
				return res.failure(-1, 'Unauthorized', 403);
			}
		} else if (req.user.rol !== 'admin') {
			if (req.method == 'GET') {
				return res.failure(-1, 'Unauthorized', 403);
			} else if (req.method == 'POST') {
				return res.failure(-1, 'Admin access needed', 403);
			}
		}

		return next();
	},

	/**
	 * Limita la cantidad de requests en un período de tiempo
	 */
	rateLimiter(req, res, next) {
		limiter.removeTokens(1, (err, remainingRequests) => {
			if (remainingRequests < 0) {
				res.writeHead(429, { 'Content-Type': 'text/plain;charset=UTF-8' });
				res.end('Too Many Requests - your IP is being rate limited');
			}

			return next();
		});
	},
};
