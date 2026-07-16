import { Empresa, Usuario, Suscripcion, Plan, Tienda, sequelize } from '../models/index.js';
import CatalogService from './catalogo.service.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt.js';
import { supabase } from '../utils/supabase.js';
import { addDays, isAfter, differenceInDays } from 'date-fns';

class AuthService {
  async getPlanes() {
    return await Plan.findAll({ where: { estado: 'activo' } });
  }

  /**
   * Sube un archivo a Supabase Storage y retorna la URL pública.
   */
  async _uploadFileToSupabase(empresa_id, file, bucket = process.env.SUPABASE_BUCKET || 'comprobantes') {
    const fileName = `${empresa_id}/${Date.now()}-${file.originalname}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (uploadError) throw new Error(`Error Supabase: ${uploadError.message}`);

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  }

  async registerEmpresa({ nombre_empresa, nombre_admin, username, email, password, plan_id, referencia_pago = null }, file = null) {
    const transaction = await sequelize.transaction();
    try {
      // 1. Validar que si no viene email, generamos uno técnico
      if (!email || email.trim() === '') {
        const domain = nombre_empresa.toLowerCase().replace(/[^a-z0-9]/g, '') || 'retail';
        email = `${username.toLowerCase()}@${domain}.com`;
      }

      // 2. Create Empresa
      const empresa = await Empresa.create({ nombre: nombre_empresa }, { transaction });

      // 3. Create Default Store (Sucursal Principal)
      const tienda = await Tienda.create({ 
        nombre: 'Sucursal Principal', 
        empresa_id: empresa.id 
      }, { transaction });

      // 4. Create Admin User (Global - No vinculado a tienda específica)
      const admin = await Usuario.create({
        empresa_id: empresa.id,
        tienda_id: null, // Admin Global de la empresa
        nombre: nombre_admin,
        username,
        email,
        password,
        rol: 'admin'
      }, { transaction });

      // 5. Procesar Comprobante si viene en el registro (One-Shot)
      let imagen_pago = null;
      if (file) {
        imagen_pago = await this._uploadFileToSupabase(empresa.id, file);
      }

      // 6. Create Pending Subscription
      await Suscripcion.create({
        empresa_id: empresa.id,
        plan_id: plan_id || 1,
        estado: 'pendiente',
        imagen_pago,
        referencia_pago
      }, { transaction });

      // 7. Seed Standard Catalog
      await CatalogService.seedRetailCatalog(empresa.id, transaction);

      await transaction.commit();
      
      return { 
        empresa: {
          id: empresa.id,
          nombre: empresa.nombre
        },
        admin: {
          id: admin.id,
          nombre: admin.nombre,
          username: admin.username,
          email: admin.email,
          rol: admin.rol,
          tienda_id: admin.tienda_id
        },
        tienda: {
          id: tienda.id,
          nombre: tienda.nombre
        }
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async login(username, password) {
    const user = await Usuario.findOne({ 
      where: { username },
      include: [
        { model: Empresa },
        { model: Tienda }
      ] 
    });
    
    if (!user || user.estado !== 'activo') {
      throw new Error('Invalid credentials or inactive user');
    }

    const isMatch = await user.validPassword(password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { user_id: user.id, empresa_id: user.empresa_id, rol: user.rol, tienda_id: user.tienda_id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return { 
      token, 
      user: { 
        id: user.id, 
        nombre: user.nombre, 
        username: user.username, 
        rol: user.rol, 
        empresa_id: user.empresa_id,
        tienda_id: user.tienda_id
      },
      empresa: {
        id: user.Empresa?.id,
        nombre: user.Empresa?.nombre,
        whatsapp_enabled: user.Empresa?.whatsapp_enabled || false
      },
      tienda: user.Tienda ? {
        id: user.Tienda.id,
        nombre: user.Tienda.nombre,
        direccion: user.Tienda.direccion
      } : null
    };
  }

  async registrarPagoSuscripcion(empresa_id, file, referencia_pago, plan_id = null) {
    const publicUrl = await this._uploadFileToSupabase(empresa_id, file);

    const lastSub = await Suscripcion.findOne({
      where: { empresa_id },
      order: [['created_at', 'DESC']]
    });

    const suscripcion = await Suscripcion.create({
      empresa_id,
      plan_id: plan_id || (lastSub ? lastSub.plan_id : 1),
      imagen_pago: publicUrl,
      referencia_pago,
      estado: 'pendiente',
      estado_registro: 'activo'
    });

    return suscripcion;
  }

  async aprobarSuscripcion(suscripcion_id) {
    return await sequelize.transaction(async (t) => {
      const suscripcion = await Suscripcion.findByPk(suscripcion_id, { 
        lock: t.LOCK.UPDATE, 
        transaction: t 
      });

      if (!suscripcion) throw new Error('Suscripción no encontrada');
      if (suscripcion.estado === 'activa') throw new Error('Esta suscripción ya está activa');

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

      if (ultimaActiva && isAfter(new Date(ultimaActiva.fecha_fin), new Date())) {
        const esMismoPlan = ultimaActiva.plan_id === suscripcion.plan_id;

        if (esMismoPlan) {
          fecha_inicio = new Date(ultimaActiva.fecha_fin);
          fecha_fin = addDays(fecha_inicio, 30);
        } else {
          fecha_inicio = new Date();
          fecha_fin = addDays(new Date(ultimaActiva.fecha_fin), 30);

          await ultimaActiva.update({ 
            fecha_fin: new Date(),
            estado_registro: 'inactivo' 
          }, { transaction: t });
        }
      } else {
        fecha_inicio = new Date();
        fecha_fin = addDays(fecha_inicio, 30);
      }

      await suscripcion.update({
        estado: 'activa',
        fecha_inicio,
        fecha_fin,
        estado_registro: 'activo'
      }, { transaction: t });

      return suscripcion;
    });
  }

  async getSuscripcionActual(empresa_id) {
    const suscripcion = await Suscripcion.findOne({
      where: { empresa_id, estado: 'activa' },
      include: [{ model: Plan }],
      order: [['fecha_fin', 'DESC']]
    });

    if (!suscripcion) {
      const ultima = await Suscripcion.findOne({
        where: { empresa_id },
        include: [{ model: Plan }],
        order: [['created_at', 'DESC']]
      });

      return {
        has_active: false,
        status: ultima ? ultima.estado : 'ninguna',
        last_subscription: ultima
      };
    }

    const hoy = new Date();
    const fin = new Date(suscripcion.fecha_fin);
    const dias_restantes = differenceInDays(fin, hoy);

    return {
      has_active: true,
      status: suscripcion.estado,
      dias_restantes: dias_restantes > 0 ? dias_restantes : 0,
      fecha_inicio: suscripcion.fecha_inicio,
      fecha_fin: suscripcion.fecha_fin,
      plan: suscripcion.Plan
    };
  }
}

export default new AuthService();
