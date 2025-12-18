'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Record extends Model {
    static associate(models) {
      // Record milik satu Patient
      Record.belongsTo(models.Patient, { foreignKey: 'patient_id', as: 'patient' });
      // Record ditulis oleh satu Doctor
      Record.belongsTo(models.Doctor, { foreignKey: 'doctor_id', as: 'doctor' });
    }
  }

  Record.init({
    diagnosis: DataTypes.STRING,
    treatment: DataTypes.TEXT,
    notes: DataTypes.TEXT,
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
    modelName: 'Record',
  });
  return Record;
};