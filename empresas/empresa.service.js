import { Empresa, Usuario, Suscripcion, Plan, sequelize } from '../models/index.js';
import CatalogService from '../services/catalogo.service.js';

export class EmpresaService {
  /**
   * Crear empresa COMPLETA (Retail):
   * 1. Crea la empresa
   * 2. Crea el usuario admin
   * 3. Crea la suscripción pendiente
   */
  static async crearEmpresa(data) {
    const transaction = await sequelize.transaction();
    try {
      // 1. Crear Empresa
      const empresa = await Empresa.create({
        nombre: data.nombre_empresa,
        mensaje_ticket: data.mensaje_ticket,
        whatsapp_enabled: data.whatsapp_enabled || false
      }, { transaction });

      // 2. Crear Usuario Admin
      let email = data.email;
      if (!email || email.trim() === '') {
        const domain = data.nombre_empresa.toLowerCase().replace(/[^a-z0-9]/g, '') || 'retail';
        email = `${data.username.toLowerCase()}@${domain}.com`;
      }

      const admin = await Usuario.create({
        empresa_id: empresa.id,
        nombre: data.nombre_admin,
        username: data.username,
        email,
        password: data.password,
        rol: 'admin'
      }, { transaction });

      // 3. Crear Suscripción pendiente
      const suscripcion = await Suscripcion.create({
        empresa_id: empresa.id,
        plan_id: data.plan_id || 1,
        estado: 'pendiente',
        referencia_pago: data.referencia_pago || null
      }, { transaction });

      // 4. Sembrar catálogo (Retail default categories if implemented)
      // await CatalogService.seedRetailCatalog(empresa.id, transaction);

      await transaction.commit();

      return { empresa, admin, suscripcion };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async obtenerEmpresas() {
    return await Empresa.findAll({
      order: [['id', 'DESC']],
      include: [{
        model: Suscripcion,
        as: 'Suscripciones',
        attributes: ['id', 'estado', 'fecha_inicio', 'fecha_fin'],
        include: [{
          model: Plan,
          attributes: ['id', 'nombre', 'precio']
        }]
      }]
    });
  }

  static async obtenerEmpresaPorId(id) {
    const empresa = await Empresa.findByPk(id, {
      include: [
        {
          model: Suscripcion,
          as: 'Suscripciones',
          include: [{ model: Plan }]
        },
        {
          model: Usuario,
          attributes: ['id', 'nombre', 'username', 'email', 'rol', 'estado']
        }
      ]
    });
    if (!empresa) {
      throw new Error('Empresa no encontrada');
    }
    return empresa;
  }

  static async actualizarEmpresa(id, data) {
    const empresa = await Empresa.findByPk(id);
    if (!empresa) throw new Error('Empresa no encontrada');
    return await empresa.update(data);
  }

  static async anularEmpresa(id) {
    const empresa = await Empresa.findByPk(id);
    if (!empresa) throw new Error('Empresa no encontrada');
    empresa.estado = 'inactivo';
    return await empresa.save();
  }

  static async obtenerAdmin(empresa_id) {
    const admin = await Usuario.findOne({
      where: { empresa_id, rol: 'admin' },
      attributes: ['id', 'nombre', 'username', 'email', 'rol', 'estado']
    });
    if (!admin) throw new Error('Administrador no encontrado para esta empresa');
    return admin;
  }

  static async actualizarAdmin(empresa_id, usuario_id, data) {
    const admin = await Usuario.findOne({
      where: { id: usuario_id, empresa_id, rol: 'admin' }
    });
    if (!admin) throw new Error('Administrador no encontrado o no pertenece a esta empresa');

    // Si viene password, Sequelize se encarga del hash por el hook beforeUpdate
    return await admin.update(data);
  }
}
