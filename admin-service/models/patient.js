'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Patient extends Model {
    static associate(models) {
      // Patient punya banyak Appointment
      Patient.hasMany(models.Appointment, { foreignKey: 'patient_id', as: 'appointments' });
      // Patient punya banyak Record
      Patient.hasMany(models.Record, { foreignKey: 'patient_id', as: 'records' });
    }
  }

  Patient.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    age: DataTypes.INTEGER,
    gender: DataTypes.STRING,
    address: DataTypes.STRING,
    phone: DataTypes.STRING,
    disease: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Patient',
  });
  return Patient;
};