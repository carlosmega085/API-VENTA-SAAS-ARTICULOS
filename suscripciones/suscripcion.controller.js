import { SuscripcionService } from './suscripcion.service.js';

export const crearSuscripcion = async (req, res, next) => {
  try {
    const suscripcion = await SuscripcionService.crearSuscripcion(req.body);
    res.status(201).json({
      success: true,
      message: 'Suscripción creada exitosamente',
      data: suscripcion
    });
  } catch (error) {
    if (error.message === 'Empresa no encontrada' || error.message === 'Plan no encontrado') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const listarSuscripciones = async (req, res, next) => {
  try {
    const { estado, empresa_id } = req.query;
    const suscripciones = await SuscripcionService.obtenerSuscripciones({ estado, empresa_id });
    res.status(200).json({
      success: true,
      data: suscripciones
    });
  } catch (error) {
    next(error);
  }
};

export const aprobarSuscripcion = async (req, res, next) => {
  try {
    const result = await SuscripcionService.aprobarSuscripcion(req.params.id, req.body.telefono);
    res.status(200).json({
      success: true,
      message: 'Suscripción aprobada exitosamente',
      data: result.suscripcion,
      whatsappLink: result.whatsappLink
    });
  } catch (error) {
    if (error.message === 'Suscripción no encontrada') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const denegarSuscripcion = async (req, res, next) => {
  try {
    const suscripcion = await SuscripcionService.denegarSuscripcion(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Suscripción denegada (rechazada)',
      data: suscripcion
    });
  } catch (error) {
    if (error.message === 'Suscripción no encontrada') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const editarSuscripcion = async (req, res, next) => {
  try {
    const suscripcion = await SuscripcionService.actualizarSuscripcion(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Suscripción actualizada exitosamente',
      data: suscripcion
    });
  } catch (error) {
    if (error.message === 'Suscripción no encontrada' || error.message === 'Plan no encontrado') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};
