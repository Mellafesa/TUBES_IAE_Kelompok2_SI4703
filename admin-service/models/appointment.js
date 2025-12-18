'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Appointment extends Model {
    static associate(models) {
      // Appointment milik satu Patient
      Appointment.belongsTo(models.Patient, { foreignKey: 'patient_id', as: 'patient' });
      // Appointment dengan satu Doctor
      Appointment.belongsTo(models.Doctor, { foreignKey: 'doctor_id', as: 'doctor' });
    }
  }

  Appointment.init({
    date: DataTypes.DATEONLY,
    time: DataTypes.TIME,
    status: {
      type: DataTypes.STRING,
      defaultValue: 'Scheduled'
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    doctor_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Appointment',
  });
  return Appointment;
};