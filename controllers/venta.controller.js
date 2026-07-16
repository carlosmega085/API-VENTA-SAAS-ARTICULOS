import ventaService from '../services/venta.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

class VentaController {
  async getAll(req, res) {
    try {
      const { tienda_id, fecha_inicio, fecha_fin, tipo_pago, cliente_id, estado, usuario_id } = req.query;
      const { empresa_id } = req.user;
      const targetTiendaId = tienda_id || req.user.tienda_id;
      
      const result = await ventaService.getAll(empresa_id, targetTiendaId, { 
        fecha_inicio, 
        fecha_fin, 
        tipo_pago, 
        cliente_id, 
        estado,
        usuario_id
      });
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async create(req, res) {
    try {
      const tienda_id = req.user.tienda_id || req.body.tienda_id;
      if (!tienda_id) throw new Error('Debe especificar una tienda para la venta');
      
      const result = await ventaService.create(tienda_id, req.user.id, req.body);
      return sendSuccess(res, result, 'Venta realizada con éxito', 201);
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async getByFactura(req, res) {
    try {
      const { numero_factura } = req.params;
      const { empresa_id } = req.user;
      const venta = await ventaService.getByFactura(empresa_id, numero_factura);
      if (!venta) return sendError(res, 'Factura no encontrada', 404);
      return sendSuccess(res, venta);
    } catch (error) {
      return sendError(res, error.message);
    }
  }
}

export default new VentaController();
