const express = require('express');
const morgan = require('morgan');

const usersRouter = require('./routes/api/users');
const postsRouter = require('./routes/api/posts');
const authRouter = require('./routes/auth');
const subredditRouter = require('./routes/api/subreddit');
const commentsRouter = require('./routes/api/comments');
const searchRouter = require('./routes/api/search');

const app = express();

const port = process.env.PORT || 3000;

const auth = require('./auth');

const cors = require('cors');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({credentials: true, origin: 'http://localhost:8080'}));

app.use(express.static(__dirname + "/public"));

app.use(morgan('dev'));

auth.init(app);

app.use('/users', usersRouter);
app.use('/posts', postsRouter);
app.use('/auth', authRouter);
app.use('/subreddits', subredditRouter);
app.use('/comments', commentsRouter);
app.use('/search', searchRouter);
app.use('/h', express.static("../micro-reddit-vue/dist", {index: "index.html"}));
app.use('/css', express.static("../micro-reddit-vue/dist/css"));
app.use('/js', express.static("../micro-reddit-vue/dist/js"));
app.use('/fonts', express.static("../micro-reddit-vue/dist/fonts"));



app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      message: err.message ? err.message : "Internal server error"
    }
  });
});



server = app.listen(port, () => {
  console.log(`Serwer działa pod adresem: https://localhost:${port}`);
});

require('./socket-io/socket-io').init(server);
