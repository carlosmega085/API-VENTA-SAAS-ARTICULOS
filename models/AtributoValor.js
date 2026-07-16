import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AtributoValor = sequelize.define('AtributoValor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  atributo_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  valor: {
    type: DataTypes.STRING(100),
    allowNull: false // Ej: "S", "M", "Rojo"
  }
}, {
  tableName: 'atributo_valores',
  underscored: true
});

export default AtributoValor;
