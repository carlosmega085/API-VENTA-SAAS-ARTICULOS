import { Usuario, Empresa } from '../models/index.js';

const checkAdmins = async () => {
  try {
    const admins = await Usuario.findAll({
      include: [{ model: Empresa, attributes: ['nombre'] }]
    });

    console.log('--- USERS IN DATABASE ---');
    if (admins.length === 0) {
      console.log('No users found.');
    } else {
      admins.forEach(admin => {
        console.log(`ID: ${admin.id}`);
        console.log(`Username: ${admin.username}`);
        console.log(`Email: ${admin.email}`);
        console.log(`Role: ${admin.rol}`);
        console.log(`Empresa: ${admin.Empresa?.nombre || 'None'} (ID: ${admin.empresa_id})`);
        console.log(`Password Hash: ${admin.password}`);
        console.log('------------------------------');
      });
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkAdmins();
