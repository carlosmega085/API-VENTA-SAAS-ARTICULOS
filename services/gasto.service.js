import { Gasto, Caja, CajaMovimiento, sequelize } from '../models/index.js';

class GastoService {
  /**
   * Registra un gasto y lo descuenta de la caja abierta si aplica.
   */
  async registrarGasto(empresa_id, tienda_id, usuario_id, data) {
    const { categoria, monto, descripcion, caja_id } = data;

    const transaction = await sequelize.transaction();
    try {
      // 1. Crear registro del gasto
      const gasto = await Gasto.create({
        empresa_id,
        tienda_id,
        usuario_id,
        caja_id,
        categoria,
        monto,
        descripcion
      }, { transaction });

      // 2. Si se especificó una caja, registrar el movimiento de salida
      if (caja_id) {
        const caja = await Caja.findByPk(caja_id, { transaction });
        if (!caja || caja.estado !== 'abierta') {
          throw new Error('La caja especificada no existe o no está abierta');
        }

        await CajaMovimiento.create({
          caja_id,
          usuario_id,
          tipo: 'egreso_manual',
          monto: -Math.abs(monto),
          descripcion: `GASTO: ${categoria} - ${descripcion || 'Sin detalle'}`
        }, { transaction });
      }

      await transaction.commit();
      return gasto;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async consultarGastos(tienda_id, query = {}) {
    const { desde, hasta } = query;
    const { Op } = (await import('sequelize')).default;
    const where = { tienda_id };
    
    if (desde && hasta) {
      where.created_at = {
        [Op.between]: [`${desde} 00:00:00`, `${hasta} 23:59:59`]
      };
    }

    return await Gasto.findAll({ 
      where, 
      order: [['created_at', 'DESC']] 
    });
  }
}

export default new GastoService();
