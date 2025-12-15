const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Record = sequelize.define('Record', {
  diagnosis: { type: DataTypes.STRING },
  treatment: { type: DataTypes.STRING },
  visit_date: { type: DataTypes.STRING }
});

module.exports = Record;