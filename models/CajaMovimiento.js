import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CajaMovimiento = sequelize.define('CajaMovimiento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  caja_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('apertura', 'cierre', 'venta', 'gasto', 'ingreso_manual', 'egreso_manual'),
    allowNull: false
  },
  monto: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  metodo_pago: {
    type: DataTypes.ENUM('efectivo', 'tarjeta', 'transferencia', 'credito'),
    defaultValue: 'efectivo'
  },
  referencia_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'caja_movimientos',
  underscored: true
});

export default CajaMovimiento;
