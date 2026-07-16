import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DetalleCompra = sequelize.define('DetalleCompra', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  compra_id: {
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
  costo_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'detalle_compras',
  underscored: true
});

export default DetalleCompra;
