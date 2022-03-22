const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/', async (req, res, next) => {
  try {
    const redditQueryResult = await db.query(
      'SELECT * FROM subreddit',
      []);
    res.status(200).send(redditQueryResult.rows);
  } catch (err) {
    console.log(err);
    next(Error('Internal server error'));
  }
});

router.get('/:name', async (req, res, next) => {
  try {
    let isMember = false;
    let isModerator = false;
    const redditQueryResult = await db.query(
      'SELECT * FROM subreddit WHERE name=$1::text',
      [req.params.name]);
    if(req.isAuthenticated()) {
      const memberQueryResult = await db.query(
        'SELECT 1 FROM subreddit_user WHERE user_id=$1::int AND subreddit_id=$2::int',
        [req.session.passport.user.id, redditQueryResult.rows[0].id]
      );
      const moderatorQueryResult = await db.query(
        'SELECT 1 FROM subreddit_moderator WHERE user_id=$1::int AND subreddit_id=$2::int',
        [req.session.passport.user.id, redditQueryResult.rows[0].id]
      );
      isMember = memberQueryResult.rows.length === 1;
      isModerator = moderatorQueryResult.rows.length === 1;
    }
    res.status(200).send({
      id: redditQueryResult.rows[0].id,
      name: redditQueryResult.rows[0].name,
      description: redditQueryResult.rows[0].description,
      isMember: isMember,
      isModerator: isModerator,
      isAuthenticated: req.isAuthenticated()
    });
  } catch (err) {
    console.log(err);
    next(Error('Internal server error'));
  }
});

router.post('/:name/join', async (req, res, next) => {
  if(!req.isAuthenticated()){
    const error = new Error('Odmowa dostępu: brak autentykacji')
    error.status = 401;
    next(error);
  }
  try {
    const redditQueryResult = await db.query(
      'SELECT * FROM subreddit WHERE name=$1::text',
      [req.params.name]);
    const memberQueryResult = await db.query(
      'SELECT id FROM subreddit_user WHERE user_id=$1::int AND subreddit_id=$2::int',
      [ req.session.passport.user.id, redditQueryResult.rows[0].id]);
    if(memberQueryResult.rows.length === 1) {
      const error = new Error('Użytkownik jest już członkiem tego subreddita')
      error.status = 400;
      next(error);
    }
    else {
      await db.query(
        'INSERT INTO subreddit_user(user_id, subreddit_id) VALUES ($1::int, $2::int)',
        [req.session.passport.user.id, redditQueryResult.rows[0].id]);
    }
    res.status(200).send();
  } catch (err) {
    console.log(err);
    next(Error('Internal server error'));
  }
});

router.post('/:name/leave', async (req, res, next) => {
  if(!req.isAuthenticated()){
    const error = new Error('Odmowa dostępu: brak autentykacji')
    error.status = 401;
    next(error);
  }
  try {
    const redditQueryResult = await db.query(
      'SELECT * FROM subreddit WHERE name=$1::text',
      [req.params.name]);
    const memberQueryResult = await db.query(
      'SELECT id FROM subreddit_user WHERE user_id=$1::int AND subreddit_id=$2::int',
      [req.session.passport.user.id, redditQueryResult.rows[0].id]);
    console.log(memberQueryResult);
    if(memberQueryResult.rows.length !== 1) {
      const error = new Error('Użytkownik nie jest jeszcze członkiem tego subreddita')
      error.status = 400;
      next(error);
    }
    await db.query(
      'DELETE FROM subreddit_user WHERE id=$1::int',
      [memberQueryResult.rows[0].id]);
    res.status(200).send();
  } catch (err) {
    console.log(err);
    next(Error('Internal server error'));
  }
});

router.post('/', async (req, res, next) => {
  if(!req.isAuthenticated()){
    const error = new Error('Odmowa dostępu: brak autentykacji')
    error.status = 401;
    next(error);
  }
  const dbClient = await db.getClient();
  try {
    const checkSubreddit = await dbClient.query("SELECT * FROM subreddit WHERE name=$1::text", [req.body.name]);
    if(checkSubreddit.rowCount === 0) {
      await dbClient.query("BEGIN TRANSACTION");
      const subredditQueryResult = await dbClient.query("INSERT INTO subreddit(name, description) " +
        "VALUES ($1::text, $2::text) RETURNING *",
        [req.body.name, req.body.description]);
      await dbClient.query("INSERT INTO subreddit_user(user_id, subreddit_id) " +
        "VALUES ($1::int, $2::int)",
        [req.session.passport.user.id, subredditQueryResult.rows[0].id]);
      await dbClient.query("INSERT INTO subreddit_moderator(user_id, subreddit_id) " +
        "VALUES ($1::int, $2::int)",
        [req.session.passport.user.id, subredditQueryResult.rows[0].id]);
      await dbClient.query("COMMIT");
      res.status(200).send(subredditQueryResult.rows[0]);
    }
    else {
      const error = new Error('Taki subreddit już istnieje')
      error.status = 400;
      next(error);
    }
  } catch (err) {
    await dbClient.query("ROLLBACK");
    console.log(err);
    next(Error('Internal server error'));
  }
});

router.put('/:name', async (req, res, next) => {
  if(!req.isAuthenticated()){
    const error = new Error('Odmowa dostępu: brak autentykacji')
    error.status = 401;
    next(error);
  }
  try {
    const redditQueryResult = await db.query(
      'SELECT * FROM subreddit WHERE name=$1::text',
      [req.params.name]);
    const moderatorQueryResult = await db.query(
      'SELECT 1 FROM subreddit_moderator WHERE user_id=$1::int AND subreddit_id=$2::int',
      [req.session.passport.user.id, redditQueryResult.rows[0].id]
    );
    if(moderatorQueryResult.rows.length !== 1) {
      const error = new Error('Odmowa dostępu: brak autoryzacji')
      error.status = 403;
      next(error);
    }
    else {
      await db.query(
        'UPDATE subreddit ' +
        'SET description=$1::text ' +
        'WHERE id=$2::int',
        [req.body.description, redditQueryResult.rows[0].id]
      );
    }
    res.status(200).send({
      id: redditQueryResult.rows[0].id,
      name: redditQueryResult.rows[0].name,
      description: req.body.description
    });
  } catch (err) {
    console.log(err);
    next(Error('Internal server error'));
  }
});

module.exports = router;