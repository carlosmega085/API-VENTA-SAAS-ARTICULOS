import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  empresa_id: {
    type: DataTypes.INTEGER,
    allowNull: true // Permite nulo si es superadmin (dueño del SaaS)
  },
  tienda_id: {
    type: DataTypes.INTEGER,
    allowNull: true // Permite nulo si es admin general de la empresa
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rol: {
    type: DataTypes.ENUM('superadmin', 'admin', 'vendedor'),
    defaultValue: 'vendedor'
  },
  estado: {
    type: DataTypes.ENUM('activo', 'inactivo'),
    defaultValue: 'activo'
  },
  permisos: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Configuración granular de acciones permitidas {"anular_venta": false, "ajustar_stock": true}'
  }
}, {
  tableName: 'usuarios',
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance method to check password
Usuario.prototype.validPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

export default Usuario;
