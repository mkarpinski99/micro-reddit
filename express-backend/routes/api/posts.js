const express = require('express');
const router = express.Router();
const db = require('../../db');
const storage = require('../../storage')
const io = require('../../socket-io/socket-io')

router.get('/:subreddit', async (req, res, next) => {
  try {
    const queryResult = await db.query(
      'SELECT p.*, row_to_json(u.*) as user, row_to_json(s.*) as subreddit FROM post p ' +
      'LEFT JOIN reddit_user u ' +
      'ON u.id=p.user_id ' +
      'LEFT JOIN subreddit s ' +
      'ON s.id=p.subreddit_id ' +
      'WHERE s.name=$1::text ' +
      'ORDER BY p.creation_date DESC',
      [req.params.subreddit])
    const posts = [];
    for (let post of queryResult.rows){
      const scoreQueryResult = await db.query("SELECT SUM(vote) as score FROM post_vote WHERE post_id=$1::int", [post.id]);
      let voteQueryResult;
      if(req.isAuthenticated()){
        voteQueryResult = await db.query("SELECT vote FROM post_vote WHERE post_id=$1::int AND user_id=$2::int", [post.id, req.session.passport.user.id])
      }
      posts.push({...post, score: scoreQueryResult.rows[0].score, vote: voteQueryResult && voteQueryResult.rows.length !== 0 ? voteQueryResult.rows[0].vote : 0});
    }

    res.status(200).send(posts);
  } catch (err) {
    console.log(err);
    next(Error('Internal server error'));
  }
});

router.post('/:subreddit', storage.single('file'), async (req, res, next) => {
  if(!req.isAuthenticated()){
    const error = new Error('Odmowa dostępu: brak autentykacji')
    error.status = 401;
    next(error);
  }
  try {
    const redditQueryResult = await db.query(
      'SELECT * FROM subreddit WHERE name=$1::text',
      [req.params.subreddit]);
    const queryResult = await db.query(
      'INSERT INTO post(title, content, image_path, video_url, creation_date, subreddit_id, user_id) ' +
      'VALUES ($1::text, $2::text, $3::text, $4::text, $5::timestamp, $6::int, $7::int) RETURNING *',
      [
        req.body.title,
        req.body.content,
        req.file ? `/images/${req.file.filename}` : null,
        req.body.video_url ? req.body.video_url : null,
        new Date(),
        redditQueryResult.rows[0].id,
        req.session.passport.user.id
      ]);
    const responseQuery = await db.query(
      'SELECT post.*, row_to_json(reddit_user.*) as user, row_to_json(subreddit.*) as subreddit FROM post ' +
      'LEFT JOIN subreddit ' +
      'ON post.subreddit_id=subreddit.id ' +
      'LEFT JOIN reddit_user ' +
      'ON post.user_id=reddit_user.id ' +
      'WHERE post.id=$1::int',
      [queryResult.rows[0].id]
    );
    io.emit('post:new', responseQuery.rows[0]);
    res.status(200).send(queryResult.rows[0]);
  } catch (err) {
    console.log(err);
    next(Error('Internal server error'));
  }
});

router.post('/:id/vote', async (req, res, next) => {
  if(!req.isAuthenticated()){
    const error = new Error('Odmowa dostępu: brak autentykacji');
    error.status = 401;
    next(error);
  }
  try {
    const voteQueryResult = await db.query(
      'SELECT id, vote FROM post_vote WHERE user_id=$1::int AND post_id=$2::int',
      [req.session.passport.user.id, req.params.id]);
    if(voteQueryResult.rows.length !== 0 && voteQueryResult.rows[0].vote === req.body.value) {
      const error = new Error('Już zagłosowałeś na ten post');
      error.status = 400;
      next(error);
    }
    else {
      if(voteQueryResult.rows.length !== 0) {
        await db.query('UPDATE post_vote SET vote=$1::int WHERE id=$2::int',
          [req.body.value, voteQueryResult.rows[0].id]);
      }
      else {
        await db.query(
          'INSERT INTO post_vote(vote, user_id, post_id) VALUES ($1::int, $2::int, $3::int)',
          [req.body.value, req.session.passport.user.id, parseInt(req.params.id)]);
      }
      const scoreResult = await db.query('SELECT SUM(vote) as score FROM post_vote WHERE post_id=$1::int', [req.params.id])
      io.emit('post:vote', {post_id: req.params.id, score: scoreResult.rows[0].score, user_id: req.session.passport.user.id, value: req.body.value})
      res.status(200).send({newScore: scoreResult.rows[0]});
    }
  } catch (err) {
    console.log(err);
    next(Error('Internal server error'));
  }
});


router.get('/', async (req, res, next) => {
  const sort = {
    'new': 'ORDER BY p.creation_date DESC',
    'alph': 'ORDER BY p.title ASC',
    'best': 'ORDER BY score DESC'
  }
  try {
    const queryResult = await db.query(
      'SELECT p.*, row_to_json(u.*) as user, row_to_json(s.*) as subreddit, COALESCE(SUM(pv.vote), 0) as score, COALESCE(pv.vote, 0) as vote FROM post p ' +
      'LEFT JOIN reddit_user u ' +
      'ON p.user_id=u.id ' +
      'LEFT JOIN subreddit s ' +
      'ON p.subreddit_id= s.id ' +
      'LEFT JOIN post_vote pv ' +
      'ON pv.post_id=p.id ' +
      'GROUP BY p.id, u.*, s.*, pv.vote ' +
      sort[req.query.sort] + ' ' +
      'LIMIT 10 OFFSET $1::int', [req.query.page * 10]);
    const pagesQuery = await db.query(
      'SELECT COUNT(*) as posts FROM post',[]
    );

    res.status(200).send({content: queryResult.rows, isAuthenticated: req.isAuthenticated(), maxPage: Math.ceil(pagesQuery.rows[0].posts / 10) - 1});
  } catch (err) {
    console.log(err);
    next(Error('Internal server error'));
  }
});

router.delete('/:id', async (req, res, next) => {
  if(!req.isAuthenticated()){
    const error = new Error('Odmowa dostępu: brak autentykacji')
    error.status = 401;
    next(error);
  }
  const client = await db.getClient();
  try {
    const isModeratorQueryResult = await client.query(
      'SELECT * FROM subreddit s ' +
      'LEFT JOIN subreddit_moderator sm ' +
      'ON s.id=sm.subreddit_id ' +
      'LEFT JOIN post p ' +
      'ON p.subreddit_id=s.id ' +
      'WHERE sm.user_id=$1::int AND p.id=$2::int',
      [req.session.passport.user.id, req.params.id]);
    if(isModeratorQueryResult.rows.length === 0) {
      const error = new Error('Odmowa dostępu: brak autoryzacji')
      error.status = 400;
      next(error);
    }
    else {
      await client.query('BEGIN TRANSACTION');
      await client.query('DELETE FROM comment WHERE post_id=$1::int', [req.params.id]);
      await client.query('DELETE FROM post_vote WHERE post_id=$1::int', [req.params.id]);
      const postQueryResult = await client.query('DELETE FROM post WHERE id=$1::int RETURNING *', [req.params.id]);
      const subredditQueryResult = await client.query('SELECT * FROM subreddit WHERE id=$1::int', [postQueryResult.rows[0].subreddit_id])
      await client.query('COMMIT');
      io.emit(`post:delete`, req.params.id);
      res.status(200).send();
    }
  } catch (err) {
    await client.query('ROLLBACK');
    const error = new Error(err);
    error.status = 500;
    throw error;
  }
});

module.exports = router;