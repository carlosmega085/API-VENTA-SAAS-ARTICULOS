import { Juego } from '../models/index.js';

async function updateRange() {
  try {
    const [updated] = await Juego.update(
      { rango_max: 3112 },
      { where: { tipo_numero: 'fecha' } }
    );
    console.log(`Actualizados ${updated} juegos de fecha.`);
    process.exit(0);
  } catch (error) {
    console.error('Error actualizando rango:', error);
    process.exit(1);
  }
}

updateRange();
