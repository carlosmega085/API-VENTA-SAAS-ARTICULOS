import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Gasto = sequelize.define('Gasto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  empresa_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tienda_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  caja_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Caja de la cual salió el dinero'
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Ej: servicios, nomina, mantenimiento'
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fecha: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'gastos',
  underscored: true
});

export default Gasto;
