import { Plan } from '../models/index.js';

export class PlanService {
  static async crearPlan(data) {
    return await Plan.create(data);
  }

  static async obtenerPlanes() {
    return await Plan.findAll({
      order: [['id', 'DESC']]
    });
  }

  static async obtenerPlanPorId(id) {
    const plan = await Plan.findByPk(id);
    if (!plan) {
      throw new Error('Plan no encontrado');
    }
    return plan;
  }

  static async actualizarPlan(id, data) {
    const plan = await this.obtenerPlanPorId(id);
    return await plan.update(data);
  }

  static async anularPlan(id) {
    const plan = await this.obtenerPlanPorId(id);
    plan.estado = 'inactivo';
    return await plan.save();
  }
}
