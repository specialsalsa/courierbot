const mysql = require('mysql');
require('dotenv').config();

const con = mysql.createPool({
  connectionLimit: 10,
  connectTimeout: 60 * 60 * 1000,
  acquireTimeout: 60 * 60 * 1000,
  timeout: 60 * 60 * 1000,
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD,
  charset: 'utf8mb4'
});

module.exports = {
  con
};
