'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Doctor extends Model {
    static associate(models) {
      // Doctor punya banyak Appointment
      Doctor.hasMany(models.Appointment, { foreignKey: 'doctor_id', as: 'appointments' });
      // Doctor punya banyak Record (yang dia tulis)
      Doctor.hasMany(models.Record, { foreignKey: 'doctor_id', as: 'records' });
    }
  }

  Doctor.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    specialization: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Doctor',
  });
  return Doctor;
};