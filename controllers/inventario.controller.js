import inventarioService from '../services/inventario.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

class InventarioController {
  async getStock(req, res) {
    try {
      // Si viene tienda_id en query se usa, si no, se podría usar la del usuario (si es vendedor)
      const tienda_id = req.query.tienda_id || req.user.tienda_id;
      if (!tienda_id && req.user.rol !== 'admin') {
        throw new Error('Debe especificar una tienda');
      }

      const result = await inventarioService.getStockPorTienda(tienda_id);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async ajustarStock(req, res) {
    try {
      const { tienda_id, producto_variante_id, cantidad, tipo, descripcion } = req.body;
      const result = await inventarioService.ajustarStock(
        tienda_id, 
        producto_variante_id, 
        { cantidad, tipo, descripcion }
      );
      return sendSuccess(res, result, 'Stock ajustado y movimiento registrado');
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async getMovimientos(req, res) {
    try {
      const tienda_id = req.query.tienda_id || req.user.tienda_id;
      if (!tienda_id) {
        throw new Error('Debe especificar una tienda (tienda_id)');
      }
      const result = await inventarioService.getMovimientos(tienda_id, req.query);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error.message);
    }
  }
}

export default new InventarioController();
