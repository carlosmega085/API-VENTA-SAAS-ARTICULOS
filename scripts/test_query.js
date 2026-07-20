import { LimiteNumero, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

const testQuery = async () => {
  try {
    const numero = '05';
    const fechaVenta = '2026-03-29';
    const punto_venta_id = 1;

    console.log('--- TESTING SEQUELIZE QUERY ---');
    
    // El query que usé en VentaService
    const res1 = await LimiteNumero.findOne({
      where: { 
        numero, 
        fecha: [fechaVenta, null],
        punto_venta_id: [punto_venta_id, null]
      },
      logging: console.log
    });
    console.log('RESULTADO CON [val, null]:', res1 ? 'ENCONTRADO' : 'NO ENCONTRADO');

    // Query con Op.or
    const res2 = await LimiteNumero.findOne({
      where: {
        numero,
        fecha: { [Op.or]: [fechaVenta, null] },
        punto_venta_id: { [Op.or]: [punto_venta_id, null] }
      },
      logging: console.log
    });
    console.log('RESULTADO CON Op.or [val, null]:', res2 ? 'ENCONTRADO' : 'NO ENCONTRADO');

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

testQuery();
