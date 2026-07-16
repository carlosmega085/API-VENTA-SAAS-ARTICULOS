import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Producto = sequelize.define('Producto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  empresa_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  categoria_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  nombre: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  marca: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  codigo_barra: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'productos',
  underscored: true
});

export default Producto;
