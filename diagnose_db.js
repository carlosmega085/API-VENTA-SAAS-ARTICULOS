import { Empresa, Tienda, Usuario, Suscripcion, Categoria, Atributo, AtributoValor, sequelize } from './models/index.js';

const diagnose = async () => {
  try {
    console.log('--- DIAGNÓSTICO DE REGISTRO ---');
    
    const empresa = await Empresa.findOne({ order: [['created_at', 'DESC']] });
    console.log('Ultima Empresa:', empresa?.nombre, '(ID:', empresa?.id, ')');

    if (empresa) {
      const tienda = await Tienda.findOne({ where: { empresa_id: empresa.id } });
      console.log('Tienda creada:', tienda?.nombre || '❌ NO ENCONTRADA');

      const admin = await Usuario.findOne({ where: { empresa_id: empresa.id, rol: 'admin' } });
      console.log('Admin creado:', admin?.username, '(Tienda ID:', admin?.tienda_id || '❌ NULL', ')');

      const suscripcion = await Suscripcion.findOne({ where: { empresa_id: empresa.id } });
      console.log('Suscripción:', suscripcion?.estado || '❌ NO ENCONTRADA');

      const categorias = await Categoria.count({ where: { empresa_id: empresa.id } });
      console.log('Categorías sembradas:', categorias);

      const atributos = await Atributo.count({ where: { empresa_id: empresa.id } });
      console.log('Atributos sembrados:', atributos);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error en diagnóstico:', error);
    process.exit(1);
  }
};

diagnose();
