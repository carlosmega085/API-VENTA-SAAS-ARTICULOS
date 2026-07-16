import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PeticionProcesada = sequelize.define('PeticionProcesada', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  request_id: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  endpoint: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  metodo: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  response: {
    type: DataTypes.JSON,
    allowNull: false
  },
  status_code: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  empresa_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'peticiones_procesadas',
  timestamps: false,
  indexes: [
    {
      name: 'idx_created_at',
      fields: ['created_at']
    }
  ]
});

export default PeticionProcesada;
