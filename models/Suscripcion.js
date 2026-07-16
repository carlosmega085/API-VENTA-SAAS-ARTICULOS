import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Suscripcion = sequelize.define('Suscripcion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  empresa_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  plan_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'activa', 'rechazada'),
    defaultValue: 'pendiente'
  },
  referencia_pago: {
    type: DataTypes.STRING,
    allowNull: true
  },
  imagen_pago: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fecha_inicio: {
    type: DataTypes.DATE,
    allowNull: true
  },
  fecha_fin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  estado_registro: {
    type: DataTypes.ENUM('activo', 'inactivo'),
    defaultValue: 'activo'
  }
}, {
  tableName: 'suscripciones',
  underscored: true
});

export default Suscripcion;
