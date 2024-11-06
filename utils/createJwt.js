const jwt = require('jsonwebtoken');

module.exports = (user) => {
	return jwt.sign(
		{
			sub: user._id,
			username: user.username,
			email: user.email,
		},
		process.env.JWT_SECRET,
		{
			expiresIn: 86400 * 30, // expires in 30 days
		}
	);
};
