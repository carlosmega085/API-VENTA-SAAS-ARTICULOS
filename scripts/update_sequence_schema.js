import { sequelize } from "../models/index.js";
async function updateSchema() {
  try {
    await sequelize.query("CREATE TABLE IF NOT EXISTS `secuencias_ventas` (`empresa_id` INTEGER NOT NULL PRIMARY KEY, `ultimo_numero` INTEGER NOT NULL DEFAULT 0, `created_at` DATETIME NOT NULL, `updated_at` DATETIME NOT NULL) ENGINE=InnoDB;");
    const [columns] = await sequelize.query("SHOW COLUMNS FROM `ventas` LIKE 'secuencia_venta'");
    if (columns.length === 0) {
      await sequelize.query("ALTER TABLE `ventas` ADD COLUMN `secuencia_venta` INTEGER NULL AFTER `request_id` ");
    }
    console.log("✅ DB Updated");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}
updateSchema();
