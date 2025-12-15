const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Doctor = sequelize.define('Doctor', {
  name: { type: DataTypes.STRING },
  specialty: { type: DataTypes.STRING },
  contact: { type: DataTypes.STRING }
});

module.exports = Doctor;