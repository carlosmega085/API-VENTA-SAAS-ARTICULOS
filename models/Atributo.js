import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Atributo = sequelize.define('Atributo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  empresa_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false // Ej: "Talla", "Color"
  }
}, {
  tableName: 'atributos',
  underscored: true
});

export default Atributo;
