const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Medicine = sequelize.define('Medicine', {
  name: { type: DataTypes.STRING, allowNull: false },
  dosage: { type: DataTypes.STRING },
  instructions: { type: DataTypes.STRING },
  notes: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: 'Pending' },
  
  
  patient_id: { 
    type: DataTypes.INTEGER,
    allowNull: false 
  }
});

module.exports = Medicine;