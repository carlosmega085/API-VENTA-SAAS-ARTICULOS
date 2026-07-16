import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const InventarioMovimiento = sequelize.define('InventarioMovimiento', {
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
  tipo: {
    type: DataTypes.ENUM('compra', 'venta', 'devolucion', 'ajuste', 'ajuste_positivo', 'ajuste_negativo', 'transferencia_entrada', 'transferencia_salida'),
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  referencia_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID de la venta, compra o ajuste que originó el movimiento'
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'inventario_movimientos',
  underscored: true
});

export default InventarioMovimiento;
