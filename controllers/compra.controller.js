import compraService from '../services/compra.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

class CompraController {
  
  // --- PROVEEDORES ---

  async listarProveedores(req, res) {
    try {
      const { empresa_id } = req.user; // Extraído de authenticated user
      const proveedores = await compraService.listarProveedores(empresa_id);
      return sendSuccess(res, proveedores, 'Proveedores obtenidos');
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async crearProveedor(req, res) {
    try {
      const { empresa_id } = req.user;
      const proveedor = await compraService.crearProveedor(empresa_id, req.body);
      return sendSuccess(res, proveedor, 'Proveedor creado exitosamente', 201);
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  // --- ORDENES DE COMPRA ---

  async registrarCompra(req, res) {
    try {
      const { empresa_id, id: usuario_id, tienda_id } = req.user;
      
      // Si el usuario es admin global, podría no tener tienda_id predefinido, 
      // pero en el flujo de retail, el usuario que compra siempre actúa en una tienda.
      const targetTiendaId = req.body.tienda_id || tienda_id;
      
      if (!targetTiendaId) {
        return sendError(res, 'Se requiere especificar tienda_id para registrar la compra');
      }

      const compra = await compraService.registrarCompra(
        empresa_id, 
        targetTiendaId, 
        usuario_id, 
        req.body
      );

      return sendSuccess(res, compra, 'Compra registrada e inventario actualizado', 201);
    } catch (error) {
      return sendError(res, error.message);
    }
  }
}

export default new CompraController();
