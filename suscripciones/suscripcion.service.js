import { Suscripcion, Empresa, Plan, Usuario, sequelize } from '../models/index.js';
import { enviarWhatsApp } from '../utils/whatsapp.helper.js';
import { addDays, isAfter } from 'date-fns';

export class SuscripcionService {
  static async crearSuscripcion(data) {
    const empresa = await Empresa.findByPk(data.empresa_id);
    if (!empresa) throw new Error('Empresa no encontrada');

    const plan = await Plan.findByPk(data.plan_id);
    if (!plan) throw new Error('Plan no encontrado');

    return await Suscripcion.create(data);
  }

  static async obtenerSuscripciones(filters = {}) {
    const { estado, empresa_id } = filters;
    const where = {};
    if (estado) where.estado = estado;
    if (empresa_id) where.empresa_id = empresa_id;

    return await Suscripcion.findAll({
      where,
      order: [['id', 'DESC']],
      include: [
        { 
          model: Empresa, 
          attributes: ['id', 'nombre', 'whatsapp_enabled'],
          include: [{
            model: Usuario,
            where: { rol: 'admin' },
            required: false,
            attributes: ['id', 'nombre']
          }]
        },
        { 
          model: Plan, 
          attributes: [
            'id', 'nombre', 'precio', 'limite_usuarios', 
            'limite_tiendas', 'limite_productos'
          ] 
        }
      ]
    });
  }

  /** ... */
  static async aprobarSuscripcion(id, telefonoAdminEmpresa = null) {
    return await sequelize.transaction(async (t) => {
      const suscripcion = await Suscripcion.findByPk(id, {
        include: [
          { 
            model: Empresa, 
            attributes: ['id', 'nombre', 'whatsapp_enabled'],
            include: [{
              model: Usuario,
              where: { rol: 'admin' },
              required: false,
              attributes: ['id', 'nombre']
            }]
          },
          { model: Plan, attributes: ['id', 'nombre', 'precio', 'limite_usuarios', 'limite_tiendas', 'limite_productos'] }
        ],
        lock: t.LOCK.UPDATE,
        transaction: t
      });

      if (!suscripcion) throw new Error('Suscripción no encontrada');
      if (suscripcion.estado === 'activa') throw new Error('Esta suscripción ya está activa');

      // 1. Buscar y bloquear la suscripción activa actual para cálculo preciso
      const ultimaActiva = await Suscripcion.findOne({
        where: {
          empresa_id: suscripcion.empresa_id,
          estado: 'activa'
        },
        order: [['fecha_fin', 'DESC']],
        lock: t.LOCK.UPDATE,
        transaction: t
      });

      let fecha_inicio = new Date();
      let fecha_fin;

      // Si hay una activa y aún no vence
      if (ultimaActiva && isAfter(new Date(ultimaActiva.fecha_fin), new Date())) {
        const esMismoPlan = ultimaActiva.plan_id === suscripcion.plan_id;

        if (esMismoPlan) {
          // CASO A: Renovación del mismo plan -> Se apila al final sin solaparse
          fecha_inicio = new Date(ultimaActiva.fecha_fin);
          fecha_fin = addDays(fecha_inicio, 30);
        } else {
          // CASO B: Cambio de Plan -> Surte efecto inmediato, respetando el tiempo restante
          fecha_inicio = new Date();
          fecha_fin = addDays(new Date(ultimaActiva.fecha_fin), 30);

          // Terminamos la anterior hoy mismo
          await ultimaActiva.update({ 
            fecha_fin: new Date(),
            estado_registro: 'inactivo' 
          }, { transaction: t });
        }
      } else {
        // CASO C: No hay suscripción previa o ya venció
        fecha_inicio = new Date();
        fecha_fin = addDays(fecha_inicio, 30);
      }

      // 2. Activar la nueva suscripción
      suscripcion.estado = 'activa';
      suscripcion.fecha_inicio = fecha_inicio;
      suscripcion.fecha_fin = fecha_fin;
      suscripcion.estado_registro = 'activo';
      
      await suscripcion.save({ transaction: t });

      let whatsappLink = null;

      if (suscripcion.Empresa && suscripcion.Empresa.whatsapp_enabled && telefonoAdminEmpresa) {
        const adminNombre = suscripcion.Empresa.Usuarios?.[0]?.nombre 
          ? ` ${suscripcion.Empresa.Usuarios[0].nombre}` 
          : '';
        const mensaje = `¡Hola${adminNombre}! Tu suscripción al plan '${suscripcion.Plan.nombre}' en nuestra plataforma ha sido APROBADA. Ya puedes comenzar a utilizar el sistema.`;
        whatsappLink = enviarWhatsApp(telefonoAdminEmpresa, mensaje);
      }

      return { suscripcion, whatsappLink };
    });
  }

  static async denegarSuscripcion(id) {
    const suscripcion = await Suscripcion.findByPk(id);
    if (!suscripcion) throw new Error('Suscripción no encontrada');

    suscripcion.estado = 'rechazada';
    return await suscripcion.save();
  }

  static async actualizarSuscripcion(id, data) {
    const suscripcion = await Suscripcion.findByPk(id);
    if (!suscripcion) throw new Error('Suscripción no encontrada');

    // Si se cambia el plan, validar que exista
    if (data.plan_id) {
      const plan = await Plan.findByPk(data.plan_id);
      if (!plan) throw new Error('Plan no encontrado');
    }

    return await suscripcion.update(data);
  }
}
