const express = require('express');
const router = express.Router();
const db = require('../../db');


// router.get('/', function(req, res, next) {
//   db.query('SELECT * FROM reddit_user', null)
//       .then( queryResult => {
//         res.send(queryResult.rows);
//       }).catch( err => {
//         const error = new Error(err);
//         error.status = 400;
//         throw error;
//       });
// });

router.post('/', async (req, res, next) => {
  const emailRegexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const passwordRegexp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if(req.body.email === undefined && req.body.password === undefined)
  {
    const error = new Error('Niewystarczające dane');
    error.status = 400;
    next(error);
  }
  if(!emailRegexp.test(String(req.body.email).toLowerCase())) {
    const error = new Error('Niepoprawna forma emailu');
    error.status = 400;
    next(error);
  }
  if(!passwordRegexp.test(String(req.body.password))){
    const error = new Error('Niepoprawna forma hasła');
    error.status = 400;
    next(error);
  }
  if(req.body.email !== undefined && req.body.password !== undefined) {
    try {
      const emailQueryResult = await db.query('SELECT 1 FROM reddit_user WHERE email=$1::text', [req.body.email]);
      if(emailQueryResult.rows.length === 0) {
        await db.query('INSERT INTO reddit_user(nickname, password, email) VALUES ($1::text, $2::text, $3::text)',
          [req.body.email, req.body.password, req.body.email]);
        res.status(201).send();
      }
      else {
        const error = new Error('Konto z tym adresem email już istnieje');
        error.status = 400;
        next(error);
      }
    } catch (err) {
      next(Error('Internal server error'));
    }
  }
});

router.put('/:id([0-9]+)', async (req, res, next) => {
  if(!req.isAuthenticated()) {
    const error = new Error('Odmowa dostępu: brak autentykacji');
    error.status = 401;
    next(error);
  }
  if(req.body.newPassword === undefined || req.body.oldPassword === undefined) {
    const error = new Error('Niewystarczające dane');
    error.status = 400;
    next(error);
  }
  if(req.session.passport.user.id !== parseInt(req.params.id)) {
    const error = new Error('Odmowa dostępu: brak autoryzacji');
    error.status = 403;
    next(error);
  }
  try {
    const queryPasswordResult = await db.query('SELECT password FROM reddit_user WHERE id=$1::int',
      [parseInt(req.params.id)]);
    if(queryPasswordResult.rows.length > 0 && req.body.oldPassword !== queryPasswordResult.rows[0].password) {
      const error = new Error('Stare hasło niepoprawne');
      error.status = 400;
      next(error);
    }
    const queryResult = await db.query('UPDATE reddit_user SET password=$1::text WHERE id=$2::int RETURNING id, email',
      [req.body.newPassword, parseInt(req.params.id)]);
    res.status(200).send(queryResult.rows[0]);
  } catch (err) {
    throw new Error(err);
  }
});

router.get('/:email/subreddits', async (req, res, next) => {
  if(!req.isAuthenticated()) {
    const error = new Error('Odmowa dostępu: brak autentykacji');
    error.status = 401;
    next(error);
  }
  if(req.session.passport.user.email !== req.params.email) {
    const error = new Error('Odmowa dostępu: brak autoryzacji');
    error.status = 403;
    next(error);
  }
  try {
    const queryResult = await db.query(
      'SELECT s.* FROM reddit_user u ' +
      'LEFT JOIN subreddit_user su ' +
      'ON su.user_id=u.id ' +
      'LEFT JOIN subreddit s ' +
      'ON su.subreddit_id=s.id ' +
      'WHERE u.email=$1::text',
      [req.params.email]);
    res.status(200).send(queryResult.rows);
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = router;
