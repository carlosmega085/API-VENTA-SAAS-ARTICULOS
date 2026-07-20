import { Juego } from '../models/index.js';

async function listJuegos() {
  try {
    const juegos = await Juego.findAll();
    console.log(JSON.stringify(juegos, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error listando juegos:', error);
    process.exit(1);
  }
}

listJuegos();
