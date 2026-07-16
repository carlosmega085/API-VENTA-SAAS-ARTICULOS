import {
  PeticionProcesada,
  Venta,
  DetalleVenta,
  CajaMovimiento,
  InventarioMovimiento,
  Compra,
  DetalleCompra,
  SaaSConfig,
  sequelize
} from '../models/index.js';
import { Op } from 'sequelize';
import cron from 'node-cron';

/**
 * Servicio de limpieza automática para el sistema SaaS.
 * Mantiene la base de datos eficiente eliminando registros antiguos.
 */
class CleanupService {
  /**
   * Ejecuta la limpieza de registros con más de 48 horas de antigüedad en peticiones procesadas.
   */
  async limpiarPeticionesAntiguas() {
    try {
      const fechaLimite = new Date();
      fechaLimite.setHours(fechaLimite.getHours() - 48);

      const eliminados = await PeticionProcesada.destroy({
        where: {
          created_at: {
            [Op.lt]: fechaLimite
          }
        }
      });

      if (eliminados > 0) {
        console.log(`[CLEANUP] Limpieza de peticiones completada. Registros eliminados: ${eliminados}`);
      }
    } catch (error) {
      console.error('[ERROR CLEANUP] Error al limpiar la tabla peticiones_procesadas:', error);
    }
  }

  /**
   * Elimina ventas y sus detalles basados en la configuración de días de retención.
   */
  async limpiarVentasAntiguas() {
    try {
      // 1. Consultar días de retención de la base de datos (default 90)
      const config = await SaaSConfig.findOne({ where: { key: 'dias_retencion_ventas' } });
      const diasRetencion = config ? parseInt(config.value) : 90;

      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - diasRetencion);
      const fechaLimiteStr = fechaLimite.toISOString().split('T')[0];

      console.log(`[CLEANUP] Iniciando poda de ventas anteriores a: ${fechaLimiteStr} (${diasRetencion} días)`);

      await sequelize.transaction(async (t) => {
        // Obtenemos los IDs de las ventas a eliminar para borrar sus detalles primeros
        const ventasParaBorrar = await Venta.findAll({
          where: { created_at: { [Op.lt]: fechaLimiteStr } },
          attributes: ['id'],
          transaction: t
        });

        if (ventasParaBorrar.length === 0) {
          console.log('[CLEANUP] No hay ventas antiguas para eliminar.');
          return;
        }

        const ids = ventasParaBorrar.map(v => v.id);

        // 2. Eliminar detalles
        const detallesEliminados = await DetalleVenta.destroy({
          where: { venta_id: ids },
          transaction: t
        });

        // 3. Eliminar ventas
        const ventasEliminadas = await Venta.destroy({
          where: { id: ids },
          transaction: t
        });

        console.log(`[CLEANUP] Éxito: ${ventasEliminadas} ventas y ${detallesEliminados} detalles eliminados.`);
      });
    } catch (error) {
      console.error('[ERROR CLEANUP] Error al limpiar ventas antiguas:', error);
    }
  }

  /**
   * Elimina movimientos de caja antiguos (Ingresos, Gastos, Ventas en caja).
   */
  async limpiarCajaMovimientosAntiguos(diasRetencion = 90) {
    try {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - diasRetencion);

      const eliminados = await CajaMovimiento.destroy({
        where: { created_at: { [Op.lt]: fechaLimite } }
      });

      if (eliminados > 0) {
        console.log(`[CLEANUP] Movimientos de CAJA eliminados: ${eliminados}`);
      }
    } catch (error) {
      console.error('[ERROR CLEANUP] Error en limpieza de movimientos de caja:', error);
    }
  }

  /**
   * Elimina historial de movimientos de inventario antiguos.
   */
  async limpiarInventarioMovimientosAntiguos(diasRetencion = 90) { // Historial de inventario solemos guardarlo más
    try {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - diasRetencion);

      const eliminados = await InventarioMovimiento.destroy({
        where: { created_at: { [Op.lt]: fechaLimite } }
      });

      if (eliminados > 0) {
        console.log(`[CLEANUP] Historial de INVENTARIO eliminado: ${eliminados}`);
      }
    } catch (error) {
      console.error('[ERROR CLEANUP] Error en limpieza de historial de inventario:', error);
    }
  }

  /**
   * Elimina compras a proveedores antiguas.
   */
  async limpiarComprasAntiguas(diasRetencion = 90) {
    try {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - diasRetencion);
      const fechaLimiteStr = fechaLimite.toISOString().split('T')[0];

      await sequelize.transaction(async (t) => {
        const comprasParaBorrar = await Compra.findAll({
          where: { created_at: { [Op.lt]: fechaLimiteStr } },
          attributes: ['id'],
          transaction: t
        });

        if (comprasParaBorrar.length === 0) return;

        const ids = comprasParaBorrar.map(c => c.id);

        await DetalleCompra.destroy({ where: { compra_id: ids }, transaction: t });
        const eliminadas = await Compra.destroy({ where: { id: ids }, transaction: t });

        console.log(`[CLEANUP] COMPRAS eliminadas: ${eliminadas}`);
      });
    } catch (error) {
      console.error('[ERROR CLEANUP] Error en limpieza de compras:', error);
    }
  }

  /**
   * Inicializa las tareas programadas y asegura la configuración base.
   */
  async init() {
    try {
      // 1. Asegurar que la tabla de configuración exista
      await SaaSConfig.sync();

      // 2. Asegurar config base
      await SaaSConfig.findOrCreate({
        where: { key: 'dias_retencion_ventas' },
        defaults: {
          key: 'dias_retencion_ventas',
          value: '90',
          description: 'Días de antigüedad para eliminar ventas y detalles.'
        }
      });

      //  =========================
      //  TEST INMEDIATO
      //  =========================
      console.log('[TEST] Ejecutando cleanup inmediato...');

      await this.limpiarPeticionesAntiguas();
      await this.limpiarVentasAntiguas();
      await this.limpiarCajaMovimientosAntiguos();
      await this.limpiarInventarioMovimientosAntiguos();
      await this.limpiarComprasAntiguas();

      console.log('[TEST] Cleanup inmediato terminado');

      // =========================

      // JOB 1: Peticiones  se ejecuta a las 00:00 
      cron.schedule('0 0 * * *', () => {
        this.limpiarPeticionesAntiguas();
      }, { timezone: "America/Managua" });

      cron.schedule('0 1 * * *', () => {
        console.log('[CLEANUP] Iniciando poda de logs y transacciones...');
        this.limpiarVentasAntiguas();
        this.limpiarCajaMovimientosAntiguos();
        this.limpiarInventarioMovimientosAntiguos(180); // Inventario guardamos un poco more
        this.limpiarComprasAntiguas();
      }, { timezone: "America/Managua" });

      console.log(' Cron Jobs inicializados');

    } catch (error) {
      console.error('[ERROR CLEANUP]', error);
    }
  }
}

export default new CleanupService();
