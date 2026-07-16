import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DetalleDevolucion = sequelize.define('DetalleDevolucion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  devolucion_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  producto_variante_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'detalle_devoluciones',
  underscored: true
});

export default DetalleDevolucion;
