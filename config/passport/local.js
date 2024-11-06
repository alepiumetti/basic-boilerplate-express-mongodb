/* jshint esversion: 6 */

/**
 * Requires
 */
const mongoose      = require('mongoose')
const bcrypt        = require('bcryptjs')
const passport      = require('passport')
const LocalStrategy = require('passport-local').Strategy
const ExtractJWT    = require('passport-jwt').ExtractJwt;
const JwtStrategy   = require('passport-jwt').Strategy;

/**
 * Models
 */
const usuarios = mongoose.model('usuarios')

passport.serializeUser((user, done) => { done(null, user) })

passport.deserializeUser((user, done) => { done(null, user) })

/**
 * Local
 */
passport.use('local-login', new LocalStrategy(async (username, password, done) => {
  try {
    const error = 'Error en usuario/contraseña'
    let usuario = await usuarios.findOne({ username }).exec()

    if (!usuario) {
      return done(null, false, { error })
    } else if (!bcrypt.compareSync(password, usuario.password)) {
      return done(null, false, { error })
    }

    return done(null, usuario)
  } catch (ex) {
    return done(err)
  }
}))

passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}, async (jwt_payload, done) => {
  const usuario = await usuarios.findById({ _id: jwt_payload.sub });
  if (!!usuario) {
    done(null, jwt_payload);
  } else {
    done(null, false);
  }
}));