import { Inventario, InventarioMovimiento, sequelize } from '../models/index.js';

class InventarioService {
  /**
   * Ajusta el stock de una variante en una tienda específica.
   * SIEMPRE registra un movimiento para auditoría.
   */
  async ajustarStock(tienda_id, producto_variante_id, { cantidad, tipo, referencia_id = null, descripcion = '' }, options = {}) {
    // Si se pasa una transacción externa, la usamos; si no, creamos una nueva.
    const transaction = options.transaction || await sequelize.transaction();
    const shouldCommit = !options.transaction;

    try {
      // 1. Buscar o Crear registro de inventario
      const [inventario] = await Inventario.findOrCreate({
        where: { tienda_id, producto_variante_id },
        defaults: { stock_actual: 0 },
        transaction
      });

      // 2. Calcular nuevo stock
      let delta = cantidad;
      if (['venta', 'transferencia_salida', 'ajuste_negativo'].includes(tipo)) {
        delta = -Math.abs(cantidad);
      } else {
        delta = Math.abs(cantidad);
      }

      const nuevoStock = inventario.stock_actual + delta;
      if (nuevoStock < 0) {
        throw new Error(`Stock insuficiente para variante ID ${producto_variante_id} (Disponible: ${inventario.stock_actual})`);
      }

      // 3. Actualizar Inventario
      await inventario.update({ stock_actual: nuevoStock }, { transaction });

      // 4. Registrar Movimiento
      await InventarioMovimiento.create({
        tienda_id,
        producto_variante_id,
        tipo,
        cantidad: delta,
        referencia_id,
        descripcion
      }, { transaction });

      if (shouldCommit) await transaction.commit();
      return inventario;
    } catch (error) {
      if (shouldCommit) await transaction.rollback();
      throw error;
    }
  }

  async getStockPorTienda(tienda_id) {
    return await Inventario.findAll({
      where: { tienda_id },
      include: ['ProductoVariante']
    });
  }

  async getMovimientos(tienda_id, query = {}) {
    const { producto_variante_id, tipo } = query;
    const where = { tienda_id };
    if (producto_variante_id) where.producto_variante_id = producto_variante_id;
    if (tipo) where.tipo = tipo;

    return await InventarioMovimiento.findAll({
      where,
      include: [
        {
          model: Inventario.sequelize.models.ProductoVariante,
          as: 'ProductoVariante',
          include: [
            { model: Inventario.sequelize.models.Producto, attributes: ['nombre'] },
            {
              model: Inventario.sequelize.models.AtributoValor,
              as: 'atributos',
              attributes: ['valor'],
              include: [{ model: Inventario.sequelize.models.Atributo, attributes: ['nombre'] }]
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 100
    });
  }
}

export default new InventarioService();
