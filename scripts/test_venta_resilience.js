import { Venta, sequelize } from '../models/index.js';
import ventaService from '../services/venta.service.js';

const testResilience = async () => {
  try {
    console.log('--- TESTING VENTA RESILIENCE (ID vs UUID) ---');
    
    // Obtener la última venta de la DB
    const lastVenta = await Venta.findOne({ order: [['id', 'DESC']] });
    if (!lastVenta) {
        console.log('No hay ventas para probar.');
        process.exit(0);
    }

    console.log(`PROBANDO CON ID: ${lastVenta.id}`);
    const v1 = await ventaService.getById(lastVenta.id, lastVenta.empresa_id);
    console.log('RESULTADO ID:', v1 ? 'ÉXITO ✅' : 'FALLO ❌');

    console.log(`PROBANDO CON UUID: ${lastVenta.codigo_ticket}`);
    const v2 = await ventaService.getById(lastVenta.codigo_ticket, lastVenta.empresa_id);
    console.log('RESULTADO UUID:', v2 ? 'ÉXITO ✅' : 'FALLO ❌');

    process.exit(0);
  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  }
};

testResilience();
