const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Appointment = sequelize.define('Appointment', {
  appointments_date: { type: DataTypes.STRING },
  appointments_time: { type: DataTypes.STRING },
  
  reason: { type: DataTypes.STRING }, 
  
  status: { type: DataTypes.STRING }
});

module.exports = Appointment;