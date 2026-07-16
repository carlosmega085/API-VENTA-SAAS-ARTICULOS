import { Tienda, Usuario } from '../models/index.js';
import suscripcionService from './suscripcion.service.js';

class TiendaService {
  async create(empresa_id, data) {
    // 1. Validar límite de tiendas por plan
    const currentStoresCount = await Tienda.count({ where: { empresa_id } });
    const canAdd = await suscripcionService.canAddStore(empresa_id, currentStoresCount);
    
    if (!canAdd) {
      throw new Error('Ha alcanzado el límite máximo de tiendas permitidas en su plan actual.');
    }

    return await Tienda.create({ ...data, empresa_id });
  }

  async getAll(empresa_id) {
    return await Tienda.findAll({ where: { empresa_id } });
  }

  async getById(id, empresa_id) {
    const tienda = await Tienda.findOne({ where: { id, empresa_id } });
    if (!tienda) throw new Error('Tienda no encontrada');
    return tienda;
  }

  async update(id, empresa_id, data) {
    const tienda = await this.getById(id, empresa_id);
    return await tienda.update(data);
  }

  async delete(id, empresa_id) {
    const tienda = await this.getById(id, empresa_id);
    
    // Validar que no tenga usuarios asignados
    const usuariosAsignados = await Usuario.count({ 
      where: { tienda_id: id, empresa_id } 
    });
    
    if (usuariosAsignados > 0) {
      throw new Error(`No se puede eliminar la tienda porque tiene ${usuariosAsignados} usuario(s) asignado(s).`);
    }

    return await tienda.destroy();
  }
}

export default new TiendaService();
