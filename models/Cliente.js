import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Cliente = sequelize.define('Cliente', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  empresa_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  identificacion: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  direccion: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  limite_credito: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  saldo_pendiente: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  }
}, {
  tableName: 'clientes',
  underscored: true
});

export default Cliente;
