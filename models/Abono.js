import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Abono = sequelize.define('Abono', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  venta_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  caja_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  metodo_pago: {
    type: DataTypes.ENUM('efectivo', 'tarjeta', 'transferencia'),
    defaultValue: 'efectivo'
  },
  nota: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'abonos',
  underscored: true
});

export default Abono;
