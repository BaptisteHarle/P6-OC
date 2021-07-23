const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const config = require('./config');
const tools = require('./tools');

const indexRouter = require('./routes/index');
const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/users');

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/images', express.static(`${__dirname}/images`));

app.use(config.endpoint, indexRouter);
app.use(config.endpoint, saucesRoutes);
app.use(config.endpoint, userRoutes);

// catch 404 and forward to error handler
app.use((req, res) => {
  res.json({ code: 404, message: 'not found' });
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ message: 'error', error: err });
});

module.exports = app;
