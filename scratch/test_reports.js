import reporteController from '../controllers/reporte.controller.js';
import { Venta, Usuario } from '../models/index.js';

async function test() {
  console.log("🔍 Probando inicialización de ReporteController...");
  
  // Mock req and res objects
  const req = {
    user: { empresa_id: 1, rol: 'admin' },
    query: { desde: '2026-07-01', hasta: '2026-07-31' }
  };
  
  const res = {
    status: (code) => {
      console.log(`[STATUS] ${code}`);
      return res;
    },
    json: (data) => {
      console.log("[JSON RESPONSE]", JSON.stringify(data, null, 2));
      return res;
    }
  };
  
  try {
    console.log("\n--- Probando reporteVentas ---");
    await reporteController.reporteVentas(req, res);

    console.log("\n--- Probando ventasPorVendedor ---");
    await reporteController.ventasPorVendedor(req, res);
    
    console.log("\n✅ Pruebas ejecutadas con éxito!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error en pruebas:", error);
    process.exit(1);
  }
}

test();
