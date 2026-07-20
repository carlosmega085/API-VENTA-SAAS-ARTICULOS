import { sequelize } from '../models/index.js';

const updateSchema = async () => {
  try {
    console.log('🔄 Sincronizando cambios en los modelos...');
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('✅ Base de datos actualizada con éxito.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error actualizando la base de datos:', error.message);
    process.exit(1);
  }
};

updateSchema();
