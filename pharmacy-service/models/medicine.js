'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Medicine extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    }
  }

  Medicine.init({
    name: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    dosage: DataTypes.STRING,
    instructions: DataTypes.STRING,
    notes: DataTypes.STRING,
    status: { 
      type: DataTypes.STRING, 
      defaultValue: 'Pending' 
    },
    patient_id: { 
      type: DataTypes.INTEGER,
      allowNull: false 
    }
  }, {
    sequelize, 
    modelName: 'Medicine',
  });

  return Medicine;
};