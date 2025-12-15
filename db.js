const { Sequelize } = require('sequelize');

// Konfigurasi Database
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || ''; 
const DB_NAME = 'tubes_medihub';

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  dialect: 'mysql',
  logging: false, 
});

module.exports = sequelize;