import { Empresa } from '../models/index.js';

class EmpresaService {
  /**
   * Obtiene la empresa vinculada al administrador actual.
   */
  async getEmpresaById(empresa_id) {
    const empresa = await Empresa.findByPk(empresa_id);
    if (!empresa) throw new Error('Empresa no encontrada');
    return empresa;
  }

  /**
   * Actualiza los datos de la empresa.
   */
  async updateEmpresa(empresa_id, data) {
    const empresa = await this.getEmpresaById(empresa_id);
    
    // Solo permitimos actualizar campos específicos por seguridad
    const { nombre, mensaje_ticket, whatsapp_enabled } = data;
    
    return await empresa.update({
      nombre: nombre !== undefined ? nombre : empresa.nombre,
      mensaje_ticket: mensaje_ticket !== undefined ? mensaje_ticket : empresa.mensaje_ticket,
      whatsapp_enabled: whatsapp_enabled !== undefined ? whatsapp_enabled : empresa.whatsapp_enabled
    });
  }
}

export default new EmpresaService();
