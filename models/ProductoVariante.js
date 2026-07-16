import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProductoVariante = sequelize.define('ProductoVariante', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  producto_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  sku: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  codigo_barra: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  precio_venta: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  costo: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  imagen_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'producto_variantes',
  underscored: true
});

export default ProductoVariante;
