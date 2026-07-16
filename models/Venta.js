import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Venta = sequelize.define('Venta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tienda_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  empresa_id: {
    type: DataTypes.INTEGER,
    allowNull: false,

  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  tipo_pago: {
    type: DataTypes.ENUM('contado', 'credito'),
    defaultValue: 'contado'
  },
  metodo_pago: {
    type: DataTypes.ENUM('efectivo', 'tarjeta', 'transferencia', 'otro'),
    defaultValue: 'efectivo'
  },
  total: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  descuento: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  impuesto: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  estado: {
    type: DataTypes.ENUM('pagada', 'pendiente', 'anulada'),
    defaultValue: 'pagada'
  },
  saldo_pendiente: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    comment: 'Monto que aún debe el cliente en ventas a crédito'
  },
  numero_factura: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Número correlativo de factura formateado'
  },
  secuencia_venta: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Número secuencial entero por empresa'
  }
}, {
  tableName: 'ventas',
  underscored: true
});

export default Venta;
