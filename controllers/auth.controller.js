import authService from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

import { Empresa, Tienda } from '../models/index.js';

class AuthController {
  async getPlanes(req, res) {
    try {
      const result = await authService.getPlanes();
      return sendSuccess(res, result, 'Planes disponibles obtenidos');
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async registerEmpresa(req, res) {
    try {
      const result = await authService.registerEmpresa(req.body, req.file);
      return sendSuccess(res, result, 'Empresa creada exitosamente con comprobante inicial. Pendiente de activación.');
    } catch (error) {
      return sendError(res, error.message || 'Error al registrar empresa');
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;
      const result = await authService.login(username, password);
      return sendSuccess(res, result, 'Login exitoso');
    } catch (error) {
      return sendError(res, error.message || 'Error en login', 401);
    }
  }

  async me(req, res) {
    try {
      const empresa = await Empresa.findByPk(req.user.empresa_id);
      
      // Return store information if it exists
      let tienda = null;
      if (req.user.tienda_id) {
        const t = await Tienda.findByPk(req.user.tienda_id);
        tienda = {
          id: t?.id,
          nombre: t?.nombre,
          direccion: t?.direccion
        };
      }

      return sendSuccess(res, { 
        user: {
          id: req.user.id,
          nombre: req.user.nombre,
          username: req.user.username,
          email: req.user.email,
          rol: req.user.rol,
          empresa_id: req.user.empresa_id,
          tienda_id: req.user.tienda_id
        },
        empresa: {
          id: empresa?.id,
          nombre: empresa?.nombre,
          whatsapp_enabled: empresa?.whatsapp_enabled || false
        },
        tienda: tienda
      }, 'Usuario autenticado');
    } catch(err) {
      return sendError(res, err.message);
    }
  }

  async subirComprobante(req, res) {
    try {
      if (!req.file) throw new Error('Debe subir un archivo de imagen');
      const { referencia_pago, plan_id } = req.body;
      const result = await authService.registrarPagoSuscripcion(req.user.empresa_id, req.file, referencia_pago, plan_id);
      return sendSuccess(res, result, 'Comprobante subido exitosamente. Pendiente de revisión.');
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async aprobarPago(req, res) {
    try {
      const { id } = req.params;
      const result = await authService.aprobarSuscripcion(id);
      return sendSuccess(res, result, 'Suscripción activada correctamente');
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async getSuscripcion(req, res) {
    try {
      const result = await authService.getSuscripcionActual(req.user.empresa_id);
      return sendSuccess(res, result, 'Estado de suscripción obtenido');
    } catch (error) {
      return sendError(res, error.message);
    }
  }
}

export default new AuthController();
