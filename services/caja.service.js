import { Caja, CajaMovimiento, sequelize } from '../models/index.js';

class CajaService {
  async getByTienda(tienda_id) {
    return await Caja.findAll({ where: { tienda_id } });
  }

  async obtenerActiva(tienda_id) {
    return await Caja.findOne({
      where: { tienda_id, estado: 'abierta' }
    });
  }

  async abrirCaja(tienda_id, usuario_id, { nombre = 'Caja Principal', saldo_inicial = 0 }) {
    const transaction = await sequelize.transaction();
    try {
      let finalTiendaId = tienda_id;

      // Si tienda_id no está definido, buscar la tienda asignada al usuario
      if (!finalTiendaId && usuario_id) {
        const { Usuario } = await import('../models/index.js');
        const user = await Usuario.findByPk(usuario_id, { transaction });
        if (user) {
          finalTiendaId = user.tienda_id;
        }
      }

      if (!finalTiendaId) {
        throw new Error('Debe especificar una tienda (tienda_id) para abrir la caja');
      }

      // 1. Buscar o crear la caja
      const [caja, created] = await Caja.findOrCreate({
        where: { tienda_id: finalTiendaId, nombre },
        defaults: { saldo_actual: saldo_inicial, estado: 'abierta' },
        transaction
      });

      // Si la caja ya existía y está abierta, lanzamos error descriptivo
      if (!created && caja.estado === 'abierta') {
        throw new Error(`La caja '${nombre}' ya se encuentra abierta en esta tienda. Por favor, realiza el cierre antes de intentar abrirla de nuevo.`);
      }

      await caja.update({ saldo_actual: saldo_inicial, estado: 'abierta' }, { transaction });

      // 2. Registrar movimiento de apertura
      await CajaMovimiento.create({
        caja_id: caja.id,
        usuario_id,
        tipo: 'apertura',
        monto: saldo_inicial,
        descripcion: 'Apertura de caja'
      }, { transaction });

      await transaction.commit();
      return caja;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async registrarMovimiento(caja_id, usuario_id, { tipo, monto, metodo_pago = 'efectivo', referencia_id = null, descripcion = '' }, options = {}) {
    const transaction = options.transaction || await sequelize.transaction();
    const shouldCommit = !options.transaction;
    try {
      const caja = await Caja.findByPk(caja_id, { transaction, lock: transaction.LOCK.UPDATE });
      if (!caja) throw new Error('Caja no encontrada');
      if (caja.estado !== 'abierta') throw new Error('La caja debe estar abierta para registrar movimientos');

      // Solo el efectivo afecta el saldo_actual de la caja física
      if (metodo_pago === 'efectivo') {
        let delta = monto;
        if (['gasto', 'egreso_manual', 'cierre'].includes(tipo)) {
          delta = -Math.abs(monto);
        } else {
          delta = Math.abs(monto);
        }
        await caja.update({ saldo_actual: caja.saldo_actual + delta }, { transaction });
      }

      const movimiento = await CajaMovimiento.create({
        caja_id,
        usuario_id,
        tipo,
        monto,
        metodo_pago,
        referencia_id,
        descripcion
      }, { transaction });

      if (shouldCommit) await transaction.commit();
      return movimiento;
    } catch (error) {
      if (shouldCommit) await transaction.rollback();
      throw error;
    }
  }

  /**
   * Cierra la caja y realiza el arqueo (comparación esperado vs real).
   */
  async cerrarCaja(caja_id, usuario_id, { monto_real }) {
    const transaction = await sequelize.transaction();
    try {
      const caja = await Caja.findByPk(caja_id, { transaction });
      if (!caja) throw new Error('Caja no encontrada');
      if (caja.estado === 'cerrada') throw new Error('La caja ya está cerrada');

      const saldo_esperado = parseFloat(caja.saldo_actual);
      const diferencia = monto_real - saldo_esperado;

      // 1. Registrar el movimiento de cierre con el saldo real
      await CajaMovimiento.create({
        caja_id,
        usuario_id,
        tipo: 'cierre',
        monto: monto_real,
        descripcion: `Cierre de caja. Esperado: ${saldo_esperado}, Real: ${monto_real}, Diff: ${diferencia}`
      }, { transaction });

      // 2. Marcar caja como cerrada y limpiar saldo actual
      await caja.update({ 
        estado: 'cerrada', 
        saldo_actual: 0 
      }, { transaction });

      await transaction.commit();
      return { 
        success: true, 
        saldo_esperado, 
        monto_real, 
        diferencia,
        comentario: diferencia === 0 ? 'Caja cuadrada perfectamente' : (diferencia > 0 ? 'Sobrante en caja' : 'Faltante en caja')
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default new CajaService();
