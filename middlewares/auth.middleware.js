const passport = require('passport');

exports.jwtAuth = (req, res, next) => {
  //console.log(req.headers);
  passport.authenticate('jwt', (err, user, info) => {
    if (err) {
      return res.failure(err)
    }
    else if (!user)
      return res.failure(-1, 'No autorizado', 200);

    req.logIn(user, function (err) {
      if (err) {
        next(err)
      };
      next();
    });
  })(req, res, next);
};