import { PeticionProcesada } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/response.js';

class PeticionController {
  /**
   * Endpoint de confirmación ("Safety Net").
   * Permite al frontend verificar si una petición fue procesada tras un error de red.
   */
  async confirmar(req, res) {
    try {
      const { request_id } = req.params;
      const { empresa_id } = req; // Extraído de tenantMiddleware

      const peticion = await PeticionProcesada.findOne({
        where: { request_id, empresa_id }
      });

      if (!peticion) {
        return sendError(res, 'Petición no encontrada o no procesada aún', 404);
      }

      return sendSuccess(res, {
        request_id: peticion.request_id,
        procesada: true,
        status_code: peticion.status_code,
        response: peticion.response,
        fecha: peticion.created_at
      }, 'Estado de la petición obtenido');
    } catch (error) {
      return sendError(res, error.message);
    }
  }
}

export default new PeticionController();
