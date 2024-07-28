import express from 'express';
import { pool } from '../db/index.js';

const app = express();

app.get('/groups', (req, res) => {
  console.log('Fetching groups...');
  pool.query('SELECT * FROM "groups"', (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    } else {
      res.json({ groups: results.rows });
    }
  });
});

export default app;
