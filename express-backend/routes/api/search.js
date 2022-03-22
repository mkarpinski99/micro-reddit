const express = require('express');
const router = express.Router();
const db = require('../../db');


router.get("/", async (req, res) => {
    const subredditSearchResult = await db.query("SELECT * FROM subreddit" +
      " WHERE name LIKE $1::text",
      [`%${req.query.query}%`]);
    const postSearchResult = await db.query(
      "SELECT p.*, row_to_json(u.*) as user, row_to_json(s.*) as subreddit, COALESCE(SUM(pv.vote), 0) as score, " +
      "COALESCE(pv.vote, 0) as vote FROM post p " +
      "LEFT JOIN subreddit s " +
      "ON p.subreddit_id=s.id " +
      "LEFT JOIN reddit_user u " +
      "ON p.user_id=u.id " +
      "LEFT JOIN post_vote pv " +
      "ON pv.post_id=p.id " +
      "WHERE content LIKE $1::text " +
      "GROUP BY p.id, u.*, s.*, pv.vote",
      [`%${req.query.query}%`]);
    res.status(200).send({subreddits: subredditSearchResult.rows, posts: postSearchResult.rows, isAuthenticated: req.isAuthenticated()})
  });


module.exports = router;