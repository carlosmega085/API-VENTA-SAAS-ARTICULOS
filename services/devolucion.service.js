import { 
  Devolucion, 
  DetalleDevolucion, 
  Venta, 
  CajaMovimiento, 
  Inventario, 
  InventarioMovimiento, 
  sequelize 
} from '../models/index.js';

class DevolucionService {
  /**
   * Procesa una devolución, reintegra stock y afecta caja si es necesario.
   */
  async procesarDevolucion(empresa_id, tienda_id, usuario_id, data) {
    const { venta_id, items = [], motivo, tipo_reembolso, caja_id } = data;

    const transaction = await sequelize.transaction();
    try {
      // 1. Validar venta
      const venta = await Venta.findByPk(venta_id, { transaction });
      if (!venta) throw new Error('Venta no encontrada');

      let montoDevolver = 0;

      // 2. Crear cabecera de devolución
      const devolucion = await Devolucion.create({
        venta_id,
        usuario_id,
        tienda_id,
        monto_total: 0, // Se calcula abajo
        motivo,
        tipo_reembolso
      }, { transaction });

      // 3. Procesar ítems (Stock + Auditoría)
      for (const item of items) {
        const { producto_variante_id, cantidad, precio_unitario } = item;
        const subtotal = cantidad * precio_unitario;
        montoDevolver += subtotal;

        // Crear detalle de devolución
        await DetalleDevolucion.create({
          devolucion_id: devolucion.id,
          producto_variante_id,
          cantidad,
          precio_unitario
        }, { transaction });

        // REINTEGRAR STOCK
        const [inv] = await Inventario.findOrCreate({
          where: { tienda_id, producto_variante_id },
          defaults: { stock_actual: 0 },
          transaction
        });

        await inv.update({ 
          stock_actual: inv.stock_actual + cantidad 
        }, { transaction });

        // Registrar movimiento de inventario
        await InventarioMovimiento.create({
          tienda_id,
          producto_variante_id,
          tipo: 'devolucion',
          cantidad: cantidad,
          referencia_id: devolucion.id,
          descripcion: `Devolución de Venta ID: ${venta_id}`
        }, { transaction });
      }

      // 4. Actualizar total devolución
      await devolucion.update({ monto_total: montoDevolver }, { transaction });

      // 5. AFECTAR CAJA si es reembolso en efectivo
      if (tipo_reembolso === 'efectivo' && caja_id) {
        await CajaMovimiento.create({
          caja_id,
          usuario_id,
          tipo: 'egreso_manual',
          monto: -Math.abs(montoDevolver),
          descripcion: `REEMBOLSO DEVOLUCIÓN ID: ${devolucion.id}`
        }, { transaction });
      }

      await transaction.commit();
      return devolucion;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Lista las devoluciones filtradas por empresa y opcionalmente tienda.
   */
  async listarDevoluciones(empresa_id, filters = {}) {
    const { tienda_id, desde, hasta } = filters;
    const where = { tienda_id };

    // Si viene desde/hasta, filtrar por fecha
    if (desde && hasta) {
      where.created_at = {
        [sequelize.Sequelize.Op.between]: [new Date(desde), new Date(hasta)]
      };
    }

    return await Devolucion.findAll({
      where,
      include: [
        { model: Venta, attributes: ['id', 'numero_factura'] },
        { model: sequelize.models.Tienda, attributes: ['id', 'nombre'] },
        { model: sequelize.models.Usuario, attributes: ['id', 'nombre'] }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Obtiene una devolución por ID con sus detalles.
   */
  async obtenerDevolucionPorId(id) {
    const devolucion = await Devolucion.findByPk(id, {
      include: [
        { model: Venta, attributes: ['id', 'numero_factura', 'total'] },
        { model: sequelize.models.Tienda, attributes: ['id', 'nombre'] },
        { model: sequelize.models.Usuario, attributes: ['id', 'nombre'] },
        { 
          model: DetalleDevolucion, 
          as: 'detalles',
          include: [
            { 
              model: sequelize.models.ProductoVariante,
              include: [
                { model: sequelize.models.Producto, attributes: ['nombre'] },
                {
                  model: sequelize.models.AtributoValor,
                  as: 'atributos',
                  attributes: ['valor'],
                  include: [{ model: sequelize.models.Atributo, attributes: ['nombre'] }]
                }
              ]
            }
          ]
        }
      ]
    });

    if (!devolucion) throw new Error('Devolución no encontrada');
    return devolucion;
  }
}

export default new DevolucionService();
