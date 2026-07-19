import { Venta, Abono, Cliente, Tienda, Usuario, Caja, sequelize } from '../models/index.js';
import cajaService from './caja.service.js';
import { Op } from 'sequelize';

class CreditoService {
  /**
   * Registra un abono a una venta a crédito.
   */
  async registrarAbono(usuario_id, data) {
    const { venta_id, monto, metodo_pago, caja_id, nota } = data;

    const transaction = await sequelize.transaction();
    try {
      // 1. Validar venta
      const venta = await Venta.findByPk(venta_id, { transaction });
      if (!venta) throw new Error('Venta no encontrada');
      if (venta.tipo_pago !== 'credito') throw new Error('Esta venta no es a crédito');

      const montoAbonar = Math.abs(parseFloat(monto));
      if (montoAbonar > venta.saldo_pendiente) {
        throw new Error(`El abono (${montoAbonar}) supera el saldo pendiente (${venta.saldo_pendiente})`);
      }

      // 2. Crear registro de Abono
      const abono = await Abono.create({
        venta_id,
        usuario_id,
        caja_id,
        monto: montoAbonar,
        metodo_pago,
        nota
      }, { transaction });

      // 3. Crear movimiento de caja
      await cajaService.registrarMovimiento(caja_id, usuario_id, {
        tipo: 'ingreso_manual',
        monto: montoAbonar,
        metodo_pago,
        referencia_id: abono.id,
        descripcion: `Abono de cliente - Ref. Venta #${venta.secuencia_venta || venta.id}`
      }, { transaction });

      // 4. Actualizar saldo de la venta y cliente
      const nuevoSaldo = Math.max(0, venta.saldo_pendiente - montoAbonar);
      const estadoVenta = nuevoSaldo === 0 ? 'completada' : 'pendiente';
      await venta.update({ saldo_pendiente: nuevoSaldo, estado: estadoVenta }, { transaction });

      // Actualizar saldo deudor del cliente
      if (venta.cliente_id) {
        const cliente = await Cliente.findByPk(venta.cliente_id, { transaction });
        if (cliente) {
          const nuevoSaldoDeuda = Math.max(0, parseFloat(cliente.saldo_pendiente || 0) - montoAbonar);
          await cliente.update({ saldo_pendiente: nuevoSaldoDeuda }, { transaction });
        }
      }

      await transaction.commit();
      return abono;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getCreditosPendientes(empresa_id, cliente_id = null) {
    const where = { 
      empresa_id, 
      tipo_pago: 'credito',
      saldo_pendiente: { [Op.gt]: 0 }
    };
    if (cliente_id) where.cliente_id = cliente_id;

    return await Venta.findAll({ 
      where, 
      include: ['Cliente', 'abonos'],
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Obtiene el listado de abonos filtrado por venta o por cliente.
   */
  async getAbonos(empresa_id, { venta_id, cliente_id, desde, hasta, tienda_id, usuario_id } = {}) {
    const where = {};
    if (venta_id) where.venta_id = venta_id;

    if (desde && hasta) {
      where.created_at = {
        [Op.between]: [`${desde} 00:00:00`, `${hasta} 23:59:59`]
      };
    }

    const ventaWhere = { empresa_id };
    if (cliente_id && cliente_id !== 'todos') ventaWhere.cliente_id = cliente_id;
    if (tienda_id && tienda_id !== 'todas') ventaWhere.tienda_id = tienda_id;
    if (usuario_id && usuario_id !== 'todos') ventaWhere.usuario_id = usuario_id;

    return await Abono.findAll({
      where,
      include: [
        {
          model: Venta,
          required: true,
          where: ventaWhere,
          include: [
            { model: Cliente, attributes: ['id', 'nombre'] },
            { model: Tienda, attributes: ['id', 'nombre'] },
            { model: Usuario, attributes: ['id', 'nombre'] }
          ]
        },
        {
          model: Caja,
          attributes: ['id', 'nombre']
        },
        {
          model: Usuario,
          attributes: ['id', 'nombre']
        }
      ],
      order: [['created_at', 'DESC']]
    });
  }
}

export default new CreditoService();
