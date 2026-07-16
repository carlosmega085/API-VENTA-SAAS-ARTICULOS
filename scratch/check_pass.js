import { Usuario } from '../models/index.js';

async function checkPass() {
  const user = await Usuario.findOne({ where: { username: 'admin' } });
  if (user) {
    const isValid = await user.validPassword('123456');
    console.log('Password is 123456:', isValid);
  } else {
    console.log('User not found');
  }
  process.exit(0);
}
checkPass();
