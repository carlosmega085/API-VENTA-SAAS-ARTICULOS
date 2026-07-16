import { 
  Compra, 
  DetalleCompra, 
  Proveedor, 
  Inventario, 
  sequelize 
} from '../models/index.js';
import inventarioService from './inventario.service.js';

class CompraService {
  /**
   * Registra una nueva compra a proveedor e incrementa stock.
   */
  async registrarCompra(empresa_id, tienda_id, usuario_id, data) {
    const { proveedor_id, numero_factura, metodo_pago, items = [] } = data;

    const transaction = await sequelize.transaction();
    try {
      // 1. Crear Cabecera de Compra
      const compra = await Compra.create({
        empresa_id,
        tienda_id,
        proveedor_id,
        usuario_id,
        numero_factura,
        metodo_pago,
        total: 0 // Se calculará abajo
      }, { transaction });

      let totalCompra = 0;

      // 2. Procesar Detalles e Inventario
      for (const item of items) {
        const { producto_variante_id, cantidad, costo_unitario } = item;
        const subtotal = cantidad * costo_unitario;
        totalCompra += subtotal;

        // Crear detalle
        await DetalleCompra.create({
          compra_id: compra.id,
          producto_variante_id,
          cantidad,
          costo_unitario,
          subtotal
        }, { transaction });

        // Incrementar Stock vía InventarioService (reusando lógica auditable)
        // Pasamos null como transaction porque ajustarStock ya maneja su propia transacción interna
        // pero esperen, si queremos que sea TODO O NADA, debemos pasar la transacción si ajustarStock lo permite.
        // Como ajustarStock crea su propia transacción, es mejor refactorizarlo o usarlo aquí con cuidado.
        // RESTRICCIÓN: Para asegurar atomicidad, llamaremos a la lógica base aquí.
        
        await this._incrementarStock(tienda_id, producto_variante_id, cantidad, compra.id, transaction);
      }

      // 3. Actualizar total de la compra
      await compra.update({ total: totalCompra }, { transaction });

      await transaction.commit();
      return compra;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Helper privado para incremento atómico de stock dentro de la transacción de compra.
   */
  async _incrementarStock(tienda_id, producto_variante_id, cantidad, compra_id, transaction) {
    // 1. Buscar o Crear registro de inventario
    const [inv] = await Inventario.findOrCreate({
      where: { tienda_id, producto_variante_id },
      defaults: { stock_actual: 0 },
      transaction
    });

    // 2. Actualizar stock
    const nuevoStock = inv.stock_actual + cantidad;
    await inv.update({ stock_actual: nuevoStock }, { transaction });

    // 3. Registrar Movimiento de Auditoría
    const { InventarioMovimiento } = await import('../models/index.js');
    await InventarioMovimiento.create({
      tienda_id,
      producto_variante_id,
      tipo: 'compra',
      cantidad: cantidad,
      referencia_id: compra_id,
      descripcion: `Entrada por compra ID: ${compra_id}`
    }, { transaction });
  }

  // --- GESTIÓN DE PROVEEDORES ---

  async listarProveedores(empresa_id) {
    return await Proveedor.findAll({ where: { empresa_id, estado: 'activo' } });
  }

  async crearProveedor(empresa_id, data) {
    return await Proveedor.create({ ...data, empresa_id });
  }
}

export default new CompraService();
