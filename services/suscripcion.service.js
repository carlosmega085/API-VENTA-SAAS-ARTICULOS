import { Suscripcion, Plan, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

class SuscripcionService {
  /**
   * Obtiene los límites del plan actual de una empresa.
   * Acepta suscripciones activas con fechas válidas O sin fechas (aprobadas manualmente).
   * Si no tiene ninguna suscripción activa, retorna un plan Trial básico como fallback.
   */
  async getPlanLimits(empresa_id) {
    try {
      const now = new Date();

      const suscripcion = await Suscripcion.findOne({
        where: {
          empresa_id,
          estado: 'activa',
          estado_registro: 'activo',
          [Op.or]: [
            // Con fechas válidas
            {
              fecha_inicio: { [Op.lte]: now },
              fecha_fin:    { [Op.gte]: now }
            },
            // Sin fechas asignadas (aprobadas manualmente sin fechas)
            {
              fecha_inicio: null,
              fecha_fin:    null
            }
          ]
        },
        include: [{
          model: Plan,
          attributes: [
            'limite_usuarios',
            'limite_tiendas',
            'limite_productos',
            'limite_variantes_por_p',
            'max_vendedores_por_tienda',
            'permite_fotos'
          ]
        }],
        order: [['id', 'DESC']]
      });

      if (!suscripcion || !suscripcion.Plan) {
        // Valores de fallback (Plan Trial básico)
        return {
          limite_usuarios: 5,
          limite_tiendas: 1,
          limite_productos: 50,
          limite_variantes_por_p: 5,
          max_vendedores_por_tienda: 1,
          permite_fotos: false
        };
      }

      return suscripcion.Plan;
    } catch (error) {
      console.error('[ERROR SUSCRIPCION SERVICE] No se pudo obtener límites:', error);
      throw error;
    }
  }

  /**
   * Verifica si una empresa puede agregar un nuevo producto.
   */
  async canAddProduct(empresa_id, currentProductsCount) {
    const limits = await this.getPlanLimits(empresa_id);
    return currentProductsCount < limits.limite_productos;
  }

  /**
   * Verifica si una empresa puede abrir una nueva tienda.
   */
  async canAddStore(empresa_id, currentStoresCount) {
    const limits = await this.getPlanLimits(empresa_id);
    return currentStoresCount < limits.limite_tiendas;
  }
}

export default new SuscripcionService();
