const express = require('express');
const router = express.Router();
const db = require('../../db');
const io = require('../../socket-io/socket-io')

router.get('/:postId', async (req, res, next) => {
  try {
    const queryResult = await db.query(
      'SELECT c.*, row_to_json(u.*) as user FROM comment c ' +
      'LEFT JOIN reddit_user u ' +
      'ON u.id=c.user_id ' +
      'WHERE c.post_id=$1::int',
      [req.params.postId]
    );
    console.log(queryResult)
    const postQueryResult = await db.query("SELECT p.*, row_to_json(u.*) as user FROM post p " +
      "LEFT JOIN reddit_user u " +
      "ON p.user_id=u.id " +
      "WHERE p.id=$1::int ",
      [req.params.postId]);
    const score = await db.query(
      "SELECT SUM(pv.vote) FROM post_vote pv " +
      "WHERE pv.post_id=$1::int ",
      [req.params.postId]
    )
    let isModeratorResult = null;
    let vote = null;
    if(req.isAuthenticated()) {
      isModeratorResult = await db.query(
        "SELECT 1 FROM post p " +
        "LEFT JOIN subreddit_moderator sm " +
        "ON p.subreddit_id=sm.subreddit_id " +
        "WHERE p.id=$1::int AND sm.user_id=$2::int",
        [req.params.postId, req.session.passport.user.id]);
      vote = await db.query(
        "SELECT vote FROM post_vote " +
        "WHERE post_id=$1::int AND user_id=$2::int",
        [req.params.postId, req.session.passport.user.id]
      )
    }
    console.log({post: postQueryResult.rows[0], comments: queryResult.rows, isAuthenticated: req.isAuthenticated(), score: score.rows[0]});
    res.status(200).send(
      {
        post: postQueryResult.rows[0],
        comments: queryResult.rows,
        isAuthenticated: req.isAuthenticated(),
        score: score.rows.length > 0 ? score.rows[0].sum : 0,
        isModerator: isModeratorResult ? isModeratorResult.rows.length === 1 : false,
        vote: vote ? vote.rows[0] : 0
      });
  } catch (err) {
    console.log(err);
      const error = new Error(err);
      error.status = 500;
    throw error;
  }
});

router.post('/', async (req, res, next) => {
  if(!req.isAuthenticated()){
    const error = new Error('Odmowa dostępu: brak autentykacji')
    error.status = 401;
    next(error);
  }
  try {
    const queryResult = await db.query(
      'INSERT INTO comment(content, user_id, post_id) VALUES ($1::text, $2::int, $3::int) RETURNING *',
      [req.body.content, req.session.passport.user.id, req.body.post_id]);
    const userQuery = await db.query(
      'SELECT * FROM reddit_user WHERE id=$1::int',
      [queryResult.rows[0].user_id]
    )
    io.emit(`comment:new`, {...queryResult.rows[0], user: userQuery.rows[0]})
    res.status(200).send(queryResult.rows[0]);
  } catch (err) {
    const error = new Error(err);
    error.status = 500;
    throw error;
  }
});

router.delete('/:id', async (req, res, next) => {
  if(!req.isAuthenticated()){
    const error = new Error('Odmowa dostępu: brak autentykacji')
    error.status = 401;
    next(error);
  }
  try {
    await db.query(
      'DELETE FROM comment WHERE id=$1::int',
      [req.params.id]
    );
    io.emit(`comment:delete`, req.params.id);
  } catch (err) {
    const error = new Error(err);
    error.status = 500;
    throw error;
  }
})

module.exports = router;