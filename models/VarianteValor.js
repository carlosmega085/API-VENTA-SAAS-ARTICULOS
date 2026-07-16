import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const VarianteValor = sequelize.define('VarianteValor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  producto_variante_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  atributo_valor_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'variante_valores',
  underscored: true
});

export default VarianteValor;
