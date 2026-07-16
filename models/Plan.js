import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Plan = sequelize.define('Plan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  limite_usuarios: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  },
  limite_tiendas: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  limite_productos: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  },
  limite_variantes_por_p: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  max_vendedores_por_tienda: {
    type: DataTypes.INTEGER,
    defaultValue: 2,
    comment: 'Máximo de vendedores activos por tienda'
  },
  permite_fotos: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  estado: {
    type: DataTypes.ENUM('activo', 'inactivo'),
    defaultValue: 'activo'
  }
}, {
  tableName: 'planes',
  underscored: true
});

export default Plan;
