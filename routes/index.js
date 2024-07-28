import express from 'express';

const router = express.Router();
import { pool } from '../db.js';


router.get('/groups', function(req, res, next) {
  console.log('ovdje sam');
  pool.query('SELECT * FROM "groups"', (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    } else {
      res.json({ groups: results.rows });
    }
  });
});

export default router;
