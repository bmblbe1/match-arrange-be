import createError from 'http-errors';
import express from 'express';
import admin from './firebase.js'
import groupsRouter from './groups.js';
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

const pool = new Pool( {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function authenticateToken(req,res, next){
  const token = req.headers.authorization?.split('')[1];

  if (!token){
    return res.status(403).send('No token prov');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken 
    next();
  } catch (error){
    console.error('Error veryifyin FIrebase Token: ', error);
    res.status(401).send('Unauthorized');
  }
}

app.use('/groups', authenticateToken, groupsRouter);

app.post('/api/authenticate',authenticateToken, async(req,res) => {
  const firebaseUid = req.user.uid;
  const email = req.user.email;
  const username = req.user.name || req.user.email.split('@')[0];

  try{
    const userCheck = await pool.query('SELECT * FROM users WHERE furebise_uid = $1',[firebaseUid]);

    let user;
    if ( userCheck.rows.lenght === 0 ){
      const newUser = await pool.query(
        'INSERT INTO users (username, email, firebase_uid) VALUES ($1, $2, $3) RETURNING*',
        [username, email , firebaseUid]
      );
      user= newUser.Rows[0];
    } else {
      user = userCheck.rows[0];
    }

    res.status(200).json({ user });
  } catch(err) {
    console.error('error fetching or creating user', err);
    res.status(500).send('Server error');
  }
});

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

/*app.use('/groups', function(req, res, next) {
  console.log('ovdje sam');
  pool.query('SELECT * FROM "groups"', (error, results) => {
    if (error) {
      console.log(error, 'ovdje')
      return res.status(500).json({ error: error.message });
    } else {
      res.json({ groups: results.rows });
    }
  });
})*/


export default app;