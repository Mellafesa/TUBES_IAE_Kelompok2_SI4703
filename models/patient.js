const { DataTypes } = require('sequelize');
const sequelize = require('../db'); 

const Patient = sequelize.define('Patient', {
  name: { type: DataTypes.STRING },
  age: { type: DataTypes.INTEGER },
  gender: { type: DataTypes.STRING },
  disease: { type: DataTypes.STRING },
  address: { type: DataTypes.STRING }
});

module.exports = Patient;