import sequelize from '../config/database.js';

async function patch() {
  try {
    console.log("Verificando columnas en la tabla 'abonos'...");
    const [columns] = await sequelize.query("SHOW COLUMNS FROM abonos");
    const hasCajaId = columns.some(col => col.Field === 'caja_id');
    
    if (!hasCajaId) {
      console.log("Agregando la columna 'caja_id' a la tabla 'abonos'...");
      await sequelize.query("ALTER TABLE abonos ADD COLUMN caja_id INT NULL AFTER usuario_id");
      console.log("¡Columna 'caja_id' agregada exitosamente!");
    } else {
      console.log("La columna 'caja_id' ya existe en la tabla 'abonos'.");
    }
    process.exit(0);
  } catch (error) {
    console.error("Error al aplicar el parche a la base de datos:", error);
    process.exit(1);
  }
}

patch();
