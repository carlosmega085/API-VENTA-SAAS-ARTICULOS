import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Transferencia = sequelize.define('Transferencia', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  empresa_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tienda_origen_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tienda_destino_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  usuario_envia_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  usuario_recibe_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('enviado', 'recibido', 'anulado'),
    defaultValue: 'enviado'
  },
  fecha_envio: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  fecha_recibido: {
    type: DataTypes.DATE,
    allowNull: true
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'transferencias',
  underscored: true
});

export default Transferencia;
