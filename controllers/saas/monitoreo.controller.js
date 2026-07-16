import monitoreoService from '../../services/saas/monitoreo.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

class MonitoreoController {
  async getDashboard(req, res) {
    try {
      const metrics = await monitoreoService.getGlobalMetrics();
      return sendSuccess(res, metrics, 'Métricas globales obtenidas');
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async getEmpresasStatus(req, res) {
    try {
      const status = await monitoreoService.getUsageMonitoring();
      return sendSuccess(res, status, 'Estado de empresas obtenido');
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  // Futura funcionalidad: Categorías Globales
  async createGlobalCategory(req, res) {
    try {
      const { nombre, descripcion } = req.body;
      const { Categoria } = await import('../../models/index.js');
      
      const categoria = await Categoria.create({
        nombre,
        descripcion,
        empresa_id: null // Identificador de categoría global
      });

      return sendSuccess(res, categoria, 'Categoría Global creada exitosamente');
    } catch (error) {
      return sendError(res, error.message);
    }
  }
}

export default new MonitoreoController();
