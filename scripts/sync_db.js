import { sequelize, Plan, Usuario } from '../models/index.js';

const syncDB = async () => {
  try {
    console.log('🔄 Reiniciando base de datos...');

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    const [tables] = await sequelize.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);

    for (const tableName of tableNames) {
      await sequelize.query(`DROP TABLE IF EXISTS \`${tableName}\``);
    }

    await sequelize.sync({ force: true });

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('✅ Tablas creadas');

    // SEED CORRECTO (ALINEADO CON EL MODELO)
    await Plan.bulkCreate([
      {
        nombre: 'Bronce (Básico)',
        precio: 25,
        limite_usuarios: 3,
        limite_tiendas: 1,
        limite_productos: 150,
        limite_variantes_por_p: 10,
        max_vendedores_por_tienda: 1,
        permite_fotos: false
      },
      {
        nombre: 'Plata (Pro)',
        precio: 59.99,
        limite_usuarios: 15,
        limite_tiendas: 3,
        limite_productos: 300,
        limite_variantes_por_p: 20,
        max_vendedores_por_tienda: 5,
        permite_fotos: true
      },
      {
        nombre: 'Oro (Empresarial)',
        precio: 99.99,
        limite_usuarios: 50,
        limite_tiendas: 10,
        limite_productos: 1000,
        limite_variantes_por_p: 50,
        max_vendedores_por_tienda: 10,
        permite_fotos: true
      }
    ]);

    console.log('✅ Planes insertados');

    // CREAR USUARIO SUPER ADMIN POR DEFECTO
    await Usuario.create({
      nombre: 'Super Admin',
      username: 'superadmin',
      email: 'superadmin@loto.com',
      password: 'superadmin123',
      rol: 'superadmin',
      estado: 'activo'
    });
    console.log('✅ Usuario Super Admin creado');
    console.log('🚀 DB lista');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

syncDB();