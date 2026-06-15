import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { sequelize } from '../src/models/index.js';
import User from '../src/models/user.js';

await sequelize.sync({ force: true });
console.log('⚠️  Banco resetado!');

const password = await bcrypt.hash('admin123', 10);

await User.create({
  name: 'Admin',
  email: 'admin@restaurant.com',
  password,
  role: 'ADMIN',
  active: true,
  isSuperAdmin: true,
});

console.log('✅ SuperAdmin criado!');
console.log('   Email: admin@restaurant.com');
console.log('   Senha: admin123');

process.exit(0);