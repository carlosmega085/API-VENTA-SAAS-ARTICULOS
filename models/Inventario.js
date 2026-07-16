import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Inventario = sequelize.define('Inventario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tienda_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  producto_variante_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  stock_actual: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  }
}, {
  tableName: 'inventarios',
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['tienda_id', 'producto_variante_id']
    }
  ]
});

export default Inventario;
