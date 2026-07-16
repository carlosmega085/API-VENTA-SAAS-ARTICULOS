import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SecuenciaVenta = sequelize.define('SecuenciaVenta', {
  empresa_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  ultimo_numero: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'secuencias_ventas',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default SecuenciaVenta;
