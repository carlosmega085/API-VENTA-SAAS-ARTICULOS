import { Usuario, Empresa, Plan, Suscripcion } from '../models/index.js';

class UsuarioService {
  async getAll(empresa_id) {
    const { Tienda, Caja } = await import('../models/index.js');
    return await Usuario.findAll({
      where: { empresa_id },
      attributes: { exclude: ['password'] },
      include: [{
        model: Tienda,
        attributes: ['id', 'nombre'],
        include: [{
          model: Caja,
          attributes: ['id', 'estado'],
          where: { estado: 'abierta' },
          required: false
        }]
      }]
    });
  }

  // Helper: obtener suscripción activa con plan
  async _getSuscripcionActiva(empresa_id) {
    const suscripcion = await Suscripcion.findOne({
      where: { empresa_id, estado: 'activa' },
      include: [Plan]
    });
    if (!suscripcion) throw new Error('Empresa no tiene una suscripción activa');
    return suscripcion;
  }

  // Helper: validar límite de vendedores por tienda
  async _validarLimiteTienda(empresa_id, tienda_id, maxVendedores, excludeUserId = null) {
    if (!tienda_id) return; // Admins sin tienda, skip

    const whereCondition = {
      empresa_id,
      tienda_id,
      rol: 'vendedor',
      estado: 'activo'
    };

    // Si estamos editando, excluir al usuario actual del conteo
    if (excludeUserId) {
      const { Op } = await import('sequelize');
      whereCondition.id = { [Op.ne]: excludeUserId };
    }

    const vendedoresEnTienda = await Usuario.count({ where: whereCondition });

    if (vendedoresEnTienda >= maxVendedores) {
      throw new Error(
        `Esta tienda ya tiene el máximo de vendedores permitidos (${maxVendedores}). Para aumentar el límite, actualice su plan.`
      );
    }
  }

  async create(empresa_id, { nombre, username, email, password, rol, tienda_id }) {
    // 1. Validar suscripción y obtener plan
    const suscripcion = await this._getSuscripcionActiva(empresa_id);
    const plan = suscripcion.Plan;

    // 2. Validar límite global de usuarios
    const count = await Usuario.count({ where: { empresa_id } });
    if (count >= plan.limite_usuarios) {
      throw new Error('Límite de usuarios alcanzado para su plan');
    }

    // 3. Validar username único
    const existingUser = await Usuario.findOne({ where: { username } });
    if (existingUser) {
      throw new Error('El nombre de usuario ya existe');
    }

    // 4. Validar límite de vendedores por tienda
    if (rol !== 'admin') {
      await this._validarLimiteTienda(empresa_id, tienda_id, plan.max_vendedores_por_punto);
    }

    // 5. Crear usuario
    return await Usuario.create({
      nombre,
      username,
      email,
      password,
      rol,
      empresa_id,
      tienda_id
    });
  }

  async update(id, empresa_id, updateData) {
    const usuario = await Usuario.findOne({ where: { id, empresa_id } });
    if (!usuario) throw new Error('Usuario no encontrado');

    // Si se cambia tienda_id o se reactiva un usuario, validar límite
    const nuevaTienda = updateData.tienda_id;
    const nuevoRol = updateData.rol || usuario.rol;
    const nuevoEstado = updateData.estado || usuario.estado;

    const cambiaATienda = nuevaTienda && nuevaTienda !== usuario.tienda_id;
    const seReactiva = nuevoEstado === 'activo' && usuario.estado === 'inactivo';

    if ((cambiaATienda || seReactiva) && nuevoRol !== 'admin') {
      const suscripcion = await this._getSuscripcionActiva(empresa_id);
      const tiendaTarget = nuevaTienda || usuario.tienda_id;
      await this._validarLimiteTienda(
        empresa_id,
        tiendaTarget,
        suscripcion.Plan.max_vendedores_por_punto,
        id // excluir al usuario actual del conteo
      );
    }

    return await usuario.update(updateData);
  }

  async delete(id, empresa_id) {
    const usuario = await Usuario.findOne({ where: { id, empresa_id } });
    if (!usuario) throw new Error('Usuario no encontrado');
    return await usuario.update({ estado: 'inactivo' });
  }
}

export default new UsuarioService();
