import { sequelize } from '../models/index.js';

const syncMissingTables = async () => {
  try {
    console.log('🔄 Checking for missing tables in database...');

    // 1. Authenticate connection
    await sequelize.authenticate();
    console.log('✅ Connected to database.');

    // 2. Get list of existing tables
    const [tables] = await sequelize.query('SHOW TABLES');
    const existingTables = tables.map(t => Object.values(t)[0].toLowerCase());
    console.log('Existing tables in database:', existingTables);

    // 3. Find missing tables for defined models
    const missingModels = [];
    const modelNames = Object.keys(sequelize.models);
    
    for (const modelName of modelNames) {
      const model = sequelize.models[modelName];
      const tableName = model.tableName.toLowerCase();
      if (!existingTables.includes(tableName)) {
        missingModels.push({ name: modelName, table: model.tableName });
      }
    }

    if (missingModels.length === 0) {
      console.log('✅ All tables are already present in the database.');
      process.exit(0);
    }

    console.log('⚠️ Found missing tables:', missingModels.map(m => m.table).join(', '));

    // 4. Sync missing models (CREATE TABLE IF NOT EXISTS)
    console.log('🔄 Syncing missing tables...');
    await sequelize.sync();
    console.log('✅ Missing tables created successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing missing tables:', error);
    process.exit(1);
  }
};

syncMissingTables();
