import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Compra = sequelize.define('Compra', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  empresa_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tienda_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  proveedor_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Usuario que registra la compra'
  },
  numero_factura: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Referencia de la factura del proveedor'
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  metodo_pago: {
    type: DataTypes.ENUM('efectivo', 'transferencia', 'credito'),
    defaultValue: 'efectivo'
  },
  estado: {
    type: DataTypes.ENUM('completada', 'anulada'),
    defaultValue: 'completada'
  }
}, {
  tableName: 'compras',
  underscored: true
});

export default Compra;
