import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Caja = sequelize.define('Caja', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tienda_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'Caja Principal'
  },
  saldo_actual: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  estado: {
    type: DataTypes.ENUM('abierta', 'cerrada'),
    defaultValue: 'cerrada'
  }
}, {
  tableName: 'cajas',
  underscored: true
});

export default Caja;
