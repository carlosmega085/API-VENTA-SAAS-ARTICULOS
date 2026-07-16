import { Usuario } from '../models/index.js';

async function getUsers() {
  try {
    const users = await Usuario.findAll({ attributes: ['id', 'username', 'email', 'rol'] });
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
getUsers();
