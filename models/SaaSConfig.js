import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Modelo para configuraciones globales del sistema (SaaS).
 * Permite ajustar parámetros dinámicamente desde el panel administrativo.
 */
const SaaSConfig = sequelize.define('SaaSConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'Identificador único de la configuración (ej: dias_retencion_ventas)'
  },
  value: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Valor de la configuración'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción para el administrador'
  }
}, {
  tableName: 'saas_configs',
  timestamps: true,
  underscored: true
});

export default SaaSConfig;
