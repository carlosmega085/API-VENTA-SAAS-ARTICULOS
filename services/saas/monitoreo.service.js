import { Empresa, Venta, Suscripcion, Tienda, sequelize } from '../../models/index.js';
import { Op } from 'sequelize';

class MonitoreoService {
  /**
   * Obtiene métricas globales para el Dashboard del Gestor.
   */
  async getGlobalMetrics() {
    // 1. Total de empresas activas
    const totalEmpresas = await Empresa.count();
    
    // 2. Ventas globales de hoy
    const hoy = new Date().toISOString().split('T')[0];
    const ventasHoy = await Venta.sum('total', {
      where: {
        created_at: { [Op.gte]: new Date(hoy) }
      }
    }) || 0;

    // 3. Ranking de empresas por ventas (Top 5)
    const rankingEmpresas = await Venta.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('Venta.total')), 'total_ventas'],
        [sequelize.col('Tienda->Empresa.nombre'), 'empresa_nombre']
      ],
      include: [{
        model: Tienda,
        attributes: [],
        include: [{
          model: Empresa,
          attributes: []
        }]
      }],
      group: [sequelize.col('Tienda->Empresa.id'), sequelize.col('Tienda->Empresa.nombre')],
      order: [[sequelize.literal('total_ventas'), 'DESC']],
      limit: 5,
      raw: true
    });

    return {
      totalEmpresas,
      ventasHoyGlobales: parseFloat(ventasHoy),
      rankingEmpresas: rankingEmpresas.map(r => ({
        nombre: r.empresa_nombre,
        total: parseFloat(r.total_ventas)
      }))
    };
  }

  /**
   * Monitoreo de uso de límites por empresa.
   */
  async getUsageMonitoring() {
    const empresas = await Empresa.findAll({
      include: ['Tiendas', 'Suscripciones']
    });

    return empresas.map(e => ({
      id: e.id,
      nombre: e.nombre,
      tiendasCount: e.Tiendas ? e.Tiendas.length : 0,
      activeStatus: (e.Suscripciones && e.Suscripciones.length > 0) ? 'activo' : 'inactivo'
    }));
  }
}

export default new MonitoreoService();
