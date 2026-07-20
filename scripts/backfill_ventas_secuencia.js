import { Venta, SecuenciaVenta, sequelize } from "../models/index.js";
async function backfill() {
  console.log("--- Iniciando Backfill de Secuencias de Venta ---");
  try {
    const transaction = await sequelize.transaction();
    const empresas = await Venta.findAll({
      attributes: [[sequelize.fn("DISTINCT", sequelize.col("empresa_id")), "empresa_id"]],
      raw: true,
      transaction
    });
    for (const { empresa_id } of empresas) {
      console.log(`Procesando empresa_id: ${empresa_id}...`);
      const ventas = await Venta.findAll({
        where: { empresa_id },
        order: [["created_at", "ASC"], ["id", "ASC"]],
        transaction
      });
      let contador = 0;
      for (const venta of ventas) {
        contador++;
        await venta.update({ secuencia_venta: contador }, { transaction });
      }
      await SecuenciaVenta.upsert({ empresa_id, ultimo_numero: contador }, { transaction });
      console.log(`  - Empresa ${empresa_id}: ${contador} ventas actualizadas.`);
    }
    await transaction.commit();
    console.log("✅ Backfill completado");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}
backfill();
