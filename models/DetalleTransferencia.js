import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DetalleTransferencia = sequelize.define('DetalleTransferencia', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  transferencia_id: {
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
  }
}, {
  tableName: 'detalle_transferencias',
  underscored: true
});

export default DetalleTransferencia;
