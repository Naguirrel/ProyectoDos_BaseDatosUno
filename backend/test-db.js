const pool = require('./src/db/connection');

async function test() {
  const res = await pool.query('SELECT NOW()');
  console.log(res.rows);
}

test();