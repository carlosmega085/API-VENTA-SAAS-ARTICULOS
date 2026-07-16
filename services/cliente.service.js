import { Cliente } from '../models/index.js';

class ClienteService {
  async getAll(empresa_id) {
    return await Cliente.findAll({ where: { empresa_id } });
  }

  async create(empresa_id, data) {
    return await Cliente.create({ ...data, empresa_id });
  }

  async getById(id, empresa_id) {
    const cliente = await Cliente.findOne({ where: { id, empresa_id } });
    if (!cliente) throw new Error('Cliente no encontrado');
    return cliente;
  }

  async update(id, empresa_id, data) {
    const cliente = await this.getById(id, empresa_id);
    return await cliente.update(data);
  }

  async delete(id, empresa_id) {
    const cliente = await this.getById(id, empresa_id);
    return await cliente.destroy();
  }

  /**
   * Obtiene historial de ventas y abonos del cliente.
   */
  async getHistorial(id, empresa_id) {
    const cliente = await Cliente.findOne({
      where: { id, empresa_id },
      include: [
        { model: Cliente.associations.Ventas.target, as: 'Ventas', limit: 50, order: [['created_at', 'DESC']] }
      ]
    });
    if (!cliente) throw new Error('Cliente no encontrado');
    return cliente;
  }
}

export default new ClienteService();
