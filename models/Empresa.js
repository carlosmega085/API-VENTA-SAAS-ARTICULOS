import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Empresa = sequelize.define('Empresa', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('activo', 'inactivo'),
    defaultValue: 'activo'
  },
  mensaje_ticket: {
    type: DataTypes.STRING,
    defaultValue: 'Gracias por su compra. Revise su mercancía antes de salir.'
  },
  whatsapp_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'empresas',
  underscored: true
});

export default Empresa;
