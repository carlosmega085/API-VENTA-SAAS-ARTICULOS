import { sequelize, Empresa, Tienda, Usuario, Plan, Suscripcion } from '../models/index.js';

const createDefaultAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database.');

    // 1. Ensure a Plan exists
    let plan = await Plan.findOne();
    if (!plan) {
      console.log('🔄 Creating a default plan...');
      plan = await Plan.create({
        nombre: 'Bronce (Básico)',
        precio: 25.00,
        limite_usuarios: 3,
        limite_tiendas: 1,
        limite_productos: 150,
        limite_variantes_por_p: 10,
        max_vendedores_por_tienda: 1,
        permite_fotos: false,
        estado: 'activo'
      });
      console.log(`✅ Default plan created: ${plan.nombre}`);
    }

    // 2. Ensure an Empresa exists
    let empresa = await Empresa.findOne();
    if (!empresa) {
      console.log('🔄 Creating a default company...');
      empresa = await Empresa.create({
        nombre: 'Empresa Demo'
      });
      console.log(`✅ Default company created: ${empresa.nombre} (ID: ${empresa.id})`);
    }

    // 3. Ensure a Tienda exists
    let tienda = await Tienda.findOne({ where: { empresa_id: empresa.id } });
    if (!tienda) {
      console.log('🔄 Creating a default store...');
      tienda = await Tienda.create({
        nombre: 'Sucursal Principal',
        empresa_id: empresa.id
      });
      console.log(`✅ Default store created: ${tienda.nombre} (ID: ${tienda.id})`);
    }

    // 4. Ensure an Admin user exists
    let admin = await Usuario.findOne({ where: { rol: 'admin', empresa_id: empresa.id } });
    if (!admin) {
      console.log('🔄 Creating default admin user...');
      admin = await Usuario.create({
        empresa_id: empresa.id,
        tienda_id: null, // Admin global
        nombre: 'Administrador Principal',
        username: 'admin',
        email: 'admin@demo.com',
        password: 'adminpassword123', // hooks will auto-hash this
        rol: 'admin',
        estado: 'activo'
      });
      console.log('✅ Default admin user created successfully.');
    }

    // 5. Ensure Suscripcion is active for the company
    let sub = await Suscripcion.findOne({ where: { empresa_id: empresa.id } });
    if (!sub) {
      console.log('🔄 Creating active subscription...');
      const dateStart = new Date();
      const dateEnd = new Date();
      dateEnd.setDate(dateEnd.getDate() + 30);

      sub = await Suscripcion.create({
        empresa_id: empresa.id,
        plan_id: plan.id,
        estado: 'activa',
        fecha_inicio: dateStart,
        fecha_fin: dateEnd,
        estado_registro: 'activo'
      });
      console.log('✅ Subscription activated.');
    }

    console.log('\n=============================================');
    console.log('🔑 CREDENCIALES DE ACCESO ADMIN:');
    console.log(`- Usuario (username): ${admin.username}`);
    console.log(`- Contraseña (password): adminpassword123`);
    console.log(`- Rol: ${admin.rol}`);
    console.log(`- Empresa: ${empresa.nombre} (ID: ${empresa.id})`);
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
    process.exit(1);
  }
};

createDefaultAdmin();
