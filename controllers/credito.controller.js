import creditoService from '../services/credito.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

class CreditoController {
  async registrarAbono(req, res) {
    try {
      const { id: usuario_id } = req.user;
      const resultado = await creditoService.registrarAbono(usuario_id, req.body);
      return sendSuccess(res, resultado, 'Abono registrado correctamente', 201);
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async consultarCreditosPendientes(req, res) {
    try {
      const { empresa_id } = req.user;
      const { cliente_id } = req.query;
      const creditos = await creditoService.getCreditosPendientes(empresa_id, cliente_id);
      return sendSuccess(res, creditos, 'Créditos obtenidos');
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async consultarAbonos(req, res) {
    try {
      const { empresa_id } = req.user;
      const { venta_id, cliente_id, desde, hasta, tienda_id, usuario_id } = req.query;
      const abonos = await creditoService.getAbonos(empresa_id, { 
        venta_id, 
        cliente_id, 
        desde, 
        hasta, 
        tienda_id, 
        usuario_id 
      });
      return sendSuccess(res, abonos, 'Abonos obtenidos');
    } catch (error) {
      return sendError(res, error.message);
    }
  }
}

export default new CreditoController();
