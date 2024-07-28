import createError from 'http-errors';
import express from 'express';

import groupsRouter from './groups.js';
import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const { Pool } = pkg;

var app = express();

app.use('/groups', groupsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.use('/groups', function(req, res, next) {
  console.log('ovdje sam');
  pool.query('SELECT * FROM "groups"', (error, results) => {
    if (error) {
      console.log(error, 'ovdje')
      return res.status(500).json({ error: error.message });
    } else {
      res.json({ groups: results.rows });
    }
  });
})

export default app;