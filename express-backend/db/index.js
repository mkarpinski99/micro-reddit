const { Pool } = require('pg');

//TODO dodać z .env
const pool = new Pool({
  user: 'docker',
  host: 'localhost',
  database: 'MicroReddit',
  password: 'password',
  port: 5432
});


module.exports = {
  query: async (text, params) => {
    //TODO? debug można dodać
    return await pool.query(text, params);
  },
  //TODO? export client do transakcji
  getClient: async () => {
    return await pool.connect();
  }
};