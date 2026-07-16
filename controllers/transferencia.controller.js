import transferenciaService from '../services/transferencia.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

class TransferenciaController {
  async enviarTransferencia(req, res) {
    try {
      const { empresa_id, id: usuario_envia_id } = req.user;
      const transferencia = await transferenciaService.enviarTransferencia(
        empresa_id, 
        req.body, 
        usuario_envia_id
      );
      return sendSuccess(res, transferencia, 'Transferencia enviada con éxito', 201);
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async recibirTransferencia(req, res) {
    try {
      const { id: usuario_recibe_id } = req.user;
      const { id } = req.params;
      const transferencia = await transferenciaService.recibirTransferencia(id, usuario_recibe_id);
      return sendSuccess(res, transferencia, 'Transferencia recibida satisfactoriamente');
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async listarTransferencias(req, res) {
    try {
      const { empresa_id } = req.user;
      const transferencias = await transferenciaService.listarTransferencias(empresa_id, req.query);
      return sendSuccess(res, transferencias);
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async obtenerTransferencia(req, res) {
    try {
      const { id } = req.params;
      const transferencia = await transferenciaService.obtenerTransferenciaPorId(id);
      return sendSuccess(res, transferencia);
    } catch (error) {
      return sendError(res, error.message);
    }
  }
}

export default new TransferenciaController();
