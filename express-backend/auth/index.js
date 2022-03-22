const passport = require('passport');
const passportLocal = require('passport-local');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const db = require('../db');

module.exports = {
  init: (app) => {
    app.use(cookieParser());
    app.use(expressSession({
      //TODO ogarnąć to
      secret: '$sekretny_$sekret',
      resave: false,
      saveUninitialized: false
    }));
    app.use(passport.initialize());
    app.use(passport.session());


    passport.serializeUser( (user, done) => {
      done(null, {id: user.id, email: user.email});
    });

    passport.deserializeUser( async (user, done) => {
      try {
        const result = await db.query('SELECT id, email, password from reddit_user ' +
          'WHERE id=$1::int', [user.id]);
        if(result.rows.length === 0) {
          return done({ message: 'Nie ma takiego użytkownika'}, null);
        }
        return done(null, result.rows[0]);
      } catch (err) {
        return done(err);
      }
    });

    passport.use(new passportLocal.Strategy({
      usernameField: 'email',
      passwordField: 'password'
    }, async (email, password, done) => {
      try {
        const result = await db.query('SELECT id, password from reddit_user ' +
          'WHERE email=$1::text', [email]);
        console.log(result);
        if(result.rows.length === 0) {
          return done(null, false, { message: 'Nie ma takiego użytkownika'});
        }
        if(result.rows[0].password !== password) {
          return done(null, false, { message: 'Niepoprawne hasło'});
        }
        return done(null, {
          id: result.rows[0].id,
          email: email,
          password: password
        });
      } catch (err) {
        return done(err);
      }
    }));
  },
  passport: passport
}
