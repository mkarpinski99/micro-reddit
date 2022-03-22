const express = require('express');
const router = express.Router();
const {passport} = require('../auth')

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.status(200).send({id: req.session.passport.user.id, email: req.session.passport.user.email});
});

router.get('/logout', (req, res) => {
  req.logout();
  res.status(200).send();
});

router.get('/status', (req, res, next) => {
  res.status(200).send({isAuthenticated: req.isAuthenticated()})
});

module.exports = router;