import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Categoria = sequelize.define('Categoria', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  empresa_id: {
    type: DataTypes.INTEGER,
    allowNull: true // NULL significa categoría global
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'categorias',
  underscored: true
});

export default Categoria;
