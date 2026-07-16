import sequelize from '../config/database.js';
import Empresa from './Empresa.js';
import Plan from './Plan.js';
import Suscripcion from './Suscripcion.js';
import Usuario from './Usuario.js';
import Tienda from './Tienda.js';
import PeticionProcesada from './PeticionProcesada.js';
import SaaSConfig from './SaaSConfig.js';
import SecuenciaVenta from './SecuenciaVenta.js';

// --- RETAIL MODELS ---
import Categoria from './Categoria.js';
import Producto from './Producto.js';
import Atributo from './Atributo.js';
import AtributoValor from './AtributoValor.js';
import ProductoVariante from './ProductoVariante.js';
import VarianteValor from './VarianteValor.js';
import Inventario from './Inventario.js';
import InventarioMovimiento from './InventarioMovimiento.js';

// --- FINANCIAL MODELS ---
import Caja from './Caja.js';
import CajaMovimiento from './CajaMovimiento.js';
import Cliente from './Cliente.js';
import Venta from './Venta.js';
import DetalleVenta from './DetalleVenta.js';

// --- PURCHASE MODELS ---
import Proveedor from './Proveedor.js';
import Compra from './Compra.js';
import DetalleCompra from './DetalleCompra.js';

// --- PRO MODELS ---
import Gasto from './Gasto.js';
import Devolucion from './Devolucion.js';
import DetalleDevolucion from './DetalleDevolucion.js';
import Abono from './Abono.js';
import Transferencia from './Transferencia.js';
import DetalleTransferencia from './DetalleTransferencia.js';

// --- CORE RELATIONS ---

// Empresa <-> Tienda
Empresa.hasMany(Tienda, { foreignKey: 'empresa_id' });
Tienda.belongsTo(Empresa, { foreignKey: 'empresa_id' });

// Empresa <-> Suscripcion <-> Plan
Empresa.hasMany(Suscripcion, { foreignKey: 'empresa_id', as: 'Suscripciones' });
Suscripcion.belongsTo(Empresa, { foreignKey: 'empresa_id' });
Plan.hasMany(Suscripcion, { foreignKey: 'plan_id' });
Suscripcion.belongsTo(Plan, { foreignKey: 'plan_id' });

// Empresa <-> Usuario
Empresa.hasMany(Usuario, { foreignKey: 'empresa_id' });
Usuario.belongsTo(Empresa, { foreignKey: 'empresa_id' });

// Usuario <-> Tienda
Tienda.hasMany(Usuario, { foreignKey: 'tienda_id' });
Usuario.belongsTo(Tienda, { foreignKey: 'tienda_id' });

// --- RETAIL RELATIONS ---

// Empresa <-> Categoria
Empresa.hasMany(Categoria, { foreignKey: 'empresa_id' });
Categoria.belongsTo(Empresa, { foreignKey: 'empresa_id' });

// Empresa <-> Atributo
Empresa.hasMany(Atributo, { foreignKey: 'empresa_id' });
Atributo.belongsTo(Empresa, { foreignKey: 'empresa_id' });

// Atributo <-> AtributoValor
Atributo.hasMany(AtributoValor, { foreignKey: 'atributo_id', as: 'valores' });
AtributoValor.belongsTo(Atributo, { foreignKey: 'atributo_id' });

// Empresa <-> Producto
Empresa.hasMany(Producto, { foreignKey: 'empresa_id' });
Producto.belongsTo(Empresa, { foreignKey: 'empresa_id' });

// Categoria <-> Producto
Categoria.hasMany(Producto, { foreignKey: 'categoria_id' });
Producto.belongsTo(Categoria, { foreignKey: 'categoria_id' });

// Producto <-> ProductoVariante
Producto.hasMany(ProductoVariante, { foreignKey: 'producto_id', as: 'variantes' });
ProductoVariante.belongsTo(Producto, { foreignKey: 'producto_id' });

// ProductoVariante <-> AtributoValor
ProductoVariante.belongsToMany(AtributoValor, { 
  through: VarianteValor, 
  foreignKey: 'producto_variante_id',
  otherKey: 'atributo_valor_id',
  as: 'atributos'
});
AtributoValor.belongsToMany(ProductoVariante, { 
  through: VarianteValor,
  foreignKey: 'atributo_valor_id',
  otherKey: 'producto_variante_id'
});

// Tienda + ProductoVariante <-> Inventario
Tienda.hasMany(Inventario, { foreignKey: 'tienda_id' });
Inventario.belongsTo(Tienda, { foreignKey: 'tienda_id' });
ProductoVariante.hasMany(Inventario, { foreignKey: 'producto_variante_id' });
Inventario.belongsTo(ProductoVariante, { foreignKey: 'producto_variante_id' });

// InventarioMovimiento Relations
Tienda.hasMany(InventarioMovimiento, { foreignKey: 'tienda_id' });
InventarioMovimiento.belongsTo(Tienda, { foreignKey: 'tienda_id' });
ProductoVariante.hasMany(InventarioMovimiento, { foreignKey: 'producto_variante_id' });
InventarioMovimiento.belongsTo(ProductoVariante, { foreignKey: 'producto_variante_id' });

// --- FINANCIAL RELATIONS ---

// Tienda <-> Caja
Tienda.hasMany(Caja, { foreignKey: 'tienda_id' });
Caja.belongsTo(Tienda, { foreignKey: 'tienda_id' });

// Caja <-> CajaMovimiento
Caja.hasMany(CajaMovimiento, { foreignKey: 'caja_id' });
CajaMovimiento.belongsTo(Caja, { foreignKey: 'caja_id' });

// Usuario <-> CajaMovimiento
Usuario.hasMany(CajaMovimiento, { foreignKey: 'usuario_id' });
CajaMovimiento.belongsTo(Usuario, { foreignKey: 'usuario_id' });

// Empresa <-> Cliente
Empresa.hasMany(Cliente, { foreignKey: 'empresa_id' });
Cliente.belongsTo(Empresa, { foreignKey: 'empresa_id' });

// Venta relations
Tienda.hasMany(Venta, { foreignKey: 'tienda_id' });
Venta.belongsTo(Tienda, { foreignKey: 'tienda_id' });

Usuario.hasMany(Venta, { foreignKey: 'usuario_id' });
Venta.belongsTo(Usuario, { foreignKey: 'usuario_id' });

Cliente.hasMany(Venta, { foreignKey: 'cliente_id' });
Venta.belongsTo(Cliente, { foreignKey: 'cliente_id' });

// Venta <-> DetalleVenta
Venta.hasMany(DetalleVenta, { foreignKey: 'venta_id', as: 'detalles' });
DetalleVenta.belongsTo(Venta, { foreignKey: 'venta_id' });

// ProductoVariante <-> DetalleVenta
ProductoVariante.hasMany(DetalleVenta, { foreignKey: 'producto_variante_id' });
DetalleVenta.belongsTo(ProductoVariante, { foreignKey: 'producto_variante_id' });

// --- MISC ---

// PeticionProcesada
Empresa.hasMany(PeticionProcesada, { foreignKey: 'empresa_id' });
PeticionProcesada.belongsTo(Empresa, { foreignKey: 'empresa_id' });
Usuario.hasMany(PeticionProcesada, { foreignKey: 'usuario_id' });
PeticionProcesada.belongsTo(Usuario, { foreignKey: 'usuario_id' });

// Empresa <-> SecuenciaVenta
Empresa.hasOne(SecuenciaVenta, { foreignKey: 'empresa_id' });
SecuenciaVenta.belongsTo(Empresa, { foreignKey: 'empresa_id' });

// --- PURCHASE RELATIONS ---

// Empresa <-> Proveedor
Empresa.hasMany(Proveedor, { foreignKey: 'empresa_id', as: 'proveedores' });
Proveedor.belongsTo(Empresa, { foreignKey: 'empresa_id' });

// Proveedor <-> Compra
Proveedor.hasMany(Compra, { foreignKey: 'proveedor_id', as: 'compras' });
Compra.belongsTo(Proveedor, { foreignKey: 'proveedor_id' });

// Tienda <-> Compra
Tienda.hasMany(Compra, { foreignKey: 'tienda_id', as: 'comprasRecibidas' });
Compra.belongsTo(Tienda, { foreignKey: 'tienda_id' });

// Compra <-> DetalleCompra
Compra.hasMany(DetalleCompra, { foreignKey: 'compra_id', as: 'detalles' });
DetalleCompra.belongsTo(Compra, { foreignKey: 'compra_id' });

// ProductoVariante <-> DetalleCompra
ProductoVariante.hasMany(DetalleCompra, { foreignKey: 'producto_variante_id' });
DetalleCompra.belongsTo(ProductoVariante, { foreignKey: 'producto_variante_id' });

// --- PRO RELATIONS ---

// Gasto Relations
Empresa.hasMany(Gasto, { foreignKey: 'empresa_id' });
Gasto.belongsTo(Empresa, { foreignKey: 'empresa_id' });
Tienda.hasMany(Gasto, { foreignKey: 'tienda_id' });
Gasto.belongsTo(Tienda, { foreignKey: 'tienda_id' });
Caja.hasMany(Gasto, { foreignKey: 'caja_id' });
Gasto.belongsTo(Caja, { foreignKey: 'caja_id' });

// Devolucion Relations
Venta.hasMany(Devolucion, { foreignKey: 'venta_id', as: 'devoluciones' });
Devolucion.belongsTo(Venta, { foreignKey: 'venta_id' });
Tienda.hasMany(Devolucion, { foreignKey: 'tienda_id' });
Devolucion.belongsTo(Tienda, { foreignKey: 'tienda_id' });
Usuario.hasMany(Devolucion, { foreignKey: 'usuario_id' });
Devolucion.belongsTo(Usuario, { foreignKey: 'usuario_id' });

Devolucion.hasMany(DetalleDevolucion, { foreignKey: 'devolucion_id', as: 'detalles' });
DetalleDevolucion.belongsTo(Devolucion, { foreignKey: 'devolucion_id' });

// ProductoVariante <-> DetalleDevolucion
ProductoVariante.hasMany(DetalleDevolucion, { foreignKey: 'producto_variante_id' });
DetalleDevolucion.belongsTo(ProductoVariante, { foreignKey: 'producto_variante_id' });

// Abono Relations
Venta.hasMany(Abono, { foreignKey: 'venta_id', as: 'abonos' });
Abono.belongsTo(Venta, { foreignKey: 'venta_id' });
Caja.hasMany(Abono, { foreignKey: 'caja_id' });
Abono.belongsTo(Caja, { foreignKey: 'caja_id' });
Usuario.hasMany(Abono, { foreignKey: 'usuario_id' });
Abono.belongsTo(Usuario, { foreignKey: 'usuario_id' });

// Transferencia Relations
Empresa.hasMany(Transferencia, { foreignKey: 'empresa_id' });
Transferencia.belongsTo(Empresa, { foreignKey: 'empresa_id' });
Tienda.hasMany(Transferencia, { foreignKey: 'tienda_origen_id', as: 'transferenciasEnviadas' });
Transferencia.belongsTo(Tienda, { foreignKey: 'tienda_origen_id', as: 'tiendaOrigen' });
Tienda.hasMany(Transferencia, { foreignKey: 'tienda_destino_id', as: 'transferenciasRecibidas' });
Transferencia.belongsTo(Tienda, { foreignKey: 'tienda_destino_id', as: 'tiendaDestino' });

Transferencia.hasMany(DetalleTransferencia, { foreignKey: 'transferencia_id', as: 'detalles' });
DetalleTransferencia.belongsTo(Transferencia, { foreignKey: 'transferencia_id' });

// ProductoVariante <-> DetalleTransferencia
ProductoVariante.hasMany(DetalleTransferencia, { foreignKey: 'producto_variante_id' });
DetalleTransferencia.belongsTo(ProductoVariante, { foreignKey: 'producto_variante_id' });

export {
  sequelize,
  Empresa,
  Plan,
  Suscripcion,
  Usuario,
  Tienda,
  PeticionProcesada,
  SaaSConfig,
  SecuenciaVenta,
  Categoria,
  Producto,
  Atributo,
  AtributoValor,
  ProductoVariante,
  VarianteValor,
  Inventario,
  InventarioMovimiento,
  Caja,
  CajaMovimiento,
  Cliente,
  Venta,
  DetalleVenta,
  Proveedor,
  Compra,
  DetalleCompra,
  Gasto,
  Devolucion,
  DetalleDevolucion,
  Abono,
  Transferencia,
  DetalleTransferencia
};
