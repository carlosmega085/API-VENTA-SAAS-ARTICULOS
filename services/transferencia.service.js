import { 
  Transferencia, 
  DetalleTransferencia, 
  Inventario, 
  InventarioMovimiento, 
  sequelize 
} from '../models/index.js';

class TransferenciaService {
  /**
   * Registra una transferencia y descuenta stock del origen.
   */
  async enviarTransferencia(empresa_id, data, usuario_envia_id) {
    const { tienda_origen_id, tienda_destino_id, items = [], observaciones } = data;

    const transaction = await sequelize.transaction();
    try {
      // 1. Crear cabecera
      const transferencia = await Transferencia.create({
        empresa_id,
        tienda_origen_id,
        tienda_destino_id,
        usuario_envia_id,
        estado: 'enviado',
        observaciones
      }, { transaction });

      // 2. Procesar ítems y descontar de origen
      for (const item of items) {
        const { producto_variante_id, cantidad } = item;

        await DetalleTransferencia.create({
          transferencia_id: transferencia.id,
          producto_variante_id,
          cantidad
        }, { transaction });

        // DESCONTAR STOCK ORIGEN
        const invOrigen = await Inventario.findOne({
          where: { tienda_id: tienda_origen_id, producto_variante_id },
          transaction
        });

        if (!invOrigen || invOrigen.stock_actual < cantidad) {
          throw new Error(`Stock insuficiente en origen para variante ID ${producto_variante_id}`);
        }

        await invOrigen.update({ stock_actual: invOrigen.stock_actual - cantidad }, { transaction });

        // Registrar movimiento
        await InventarioMovimiento.create({
          tienda_id: tienda_origen_id,
          producto_variante_id,
          tipo: 'transferencia_salida',
          cantidad: -cantidad,
          referencia_id: transferencia.id,
          descripcion: `Envío a Tienda ID: ${tienda_destino_id}`
        }, { transaction });
      }

      await transaction.commit();
      return transferencia;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Confirma recepción y suma stock al destino.
   */
  async recibirTransferencia(transferencia_id, usuario_recibe_id) {
    const transaction = await sequelize.transaction();
    try {
      const transferencia = await Transferencia.findByPk(transferencia_id, {
        include: ['detalles'],
        transaction
      });

      if (!transferencia || transferencia.estado !== 'enviado') {
        throw new Error('Transferencia no válida para recibir o ya procesada');
      }

      // 1. Sumar stock al destino
      for (const detalle of transferencia.detalles) {
        const [invDestino] = await Inventario.findOrCreate({
          where: { tienda_id: transferencia.tienda_destino_id, producto_variante_id: detalle.producto_variante_id },
          defaults: { stock_actual: 0 },
          transaction
        });

        await invDestino.update({ stock_actual: invDestino.stock_actual + detalle.cantidad }, { transaction });

        // Registrar movimiento
        await InventarioMovimiento.create({
          tienda_id: transferencia.tienda_destino_id,
          producto_variante_id: detalle.producto_variante_id,
          tipo: 'transferencia_entrada',
          cantidad: detalle.cantidad,
          referencia_id: transferencia.id,
          descripcion: `Recibido de Tienda ID: ${transferencia.tienda_origen_id}`
        }, { transaction });
      }

      // 2. Finalizar transferencia
      await transferencia.update({
        estado: 'recibido',
        usuario_recibe_id,
        fecha_recibido: new Date()
      }, { transaction });

      await transaction.commit();
      return transferencia;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  /**
   * Lista las transferencias de la empresa.
   */
  async listarTransferencias(empresa_id, filters = {}) {
    const { tienda_origen_id, tienda_destino_id, estado } = filters;
    const where = { empresa_id };

    if (tienda_origen_id) where.tienda_origen_id = tienda_origen_id;
    if (tienda_destino_id) where.tienda_destino_id = tienda_destino_id;
    if (estado) where.estado = estado;

    return await Transferencia.findAll({
      where,
      include: [
        { model: Inventario.sequelize.models.Tienda, as: 'tiendaOrigen', attributes: ['id', 'nombre'] },
        { model: Inventario.sequelize.models.Tienda, as: 'tiendaDestino', attributes: ['id', 'nombre'] },
        {
          model: DetalleTransferencia,
          as: 'detalles',
          include: [
            {
              model: Inventario.sequelize.models.ProductoVariante,
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
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Obtiene una transferencia por ID con sus detalles.
   */
  async obtenerTransferenciaPorId(id) {
    const transferencia = await Transferencia.findByPk(id, {
      include: [
        { model: Inventario.sequelize.models.Tienda, as: 'tiendaOrigen', attributes: ['id', 'nombre'] },
        { model: Inventario.sequelize.models.Tienda, as: 'tiendaDestino', attributes: ['id', 'nombre'] },
        { 
          model: DetalleTransferencia, 
          as: 'detalles',
          include: [
            { 
              model: Inventario.sequelize.models.ProductoVariante,
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
          ]
        }
      ]
    });

    if (!transferencia) throw new Error('Transferencia no encontrada');
    return transferencia;
  }
}

export default new TransferenciaService();
