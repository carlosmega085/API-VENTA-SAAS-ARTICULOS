import { PlanService } from './plan.service.js';

export const crearPlan = async (req, res, next) => {
  try {
    const plan = await PlanService.crearPlan(req.body);
    res.status(201).json({
      success: true,
      message: 'Plan creado exitosamente',
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

export const listarPlanes = async (req, res, next) => {
  try {
    const planes = await PlanService.obtenerPlanes();
    res.status(200).json({
      success: true,
      data: planes
    });
  } catch (error) {
    next(error);
  }
};

export const editarPlan = async (req, res, next) => {
  try {
    const plan = await PlanService.actualizarPlan(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Plan actualizado exitosamente',
      data: plan
    });
  } catch (error) {
    if (error.message === 'Plan no encontrado') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const anularPlan = async (req, res, next) => {
  try {
    const plan = await PlanService.anularPlan(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Plan anulado exitosamente',
      data: plan
    });
  } catch (error) {
    if (error.message === 'Plan no encontrado') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};
