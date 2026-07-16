import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Devolucion = sequelize.define('Devolucion', {
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
  tienda_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  monto_total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  motivo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tipo_reembolso: {
    type: DataTypes.ENUM('efectivo', 'credito_tienda', 'otro'),
    defaultValue: 'efectivo'
  }
}, {
  tableName: 'devoluciones',
  underscored: true
});

export default Devolucion;
