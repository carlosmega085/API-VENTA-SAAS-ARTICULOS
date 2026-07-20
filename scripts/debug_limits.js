import { LimiteNumero, AcumuladoNumero, Venta, DetalleVenta, sequelize } from '../models/index.js';

const debugLimits = async () => {
  try {
    console.log('--- DEBUGGING LIMITS ---');
    
    const limites = await LimiteNumero.findAll();
    console.log('LIMITES EN DB:', JSON.stringify(limites, null, 2));

    const acumulados = await AcumuladoNumero.findAll();
    console.log('ACUMULADOS EN DB:', JSON.stringify(acumulados, null, 2));

    const ventas = await Venta.findAll({
        include: [{ model: DetalleVenta, as: 'detalles' }]
    });
    console.log('VENTAS RECIENTES:', JSON.stringify(ventas, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('ERROR:', error);
    process.exit(1);
  }
};

debugLimits();
