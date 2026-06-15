// scripts/seed.js
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { sequelize } from '../src/models/index.js';
import User from '../src/models/user.js';

await sequelize.sync();

const exists = await User.findOne({ where: { email: 'admin@restaurant.com' } });

if (exists) {
  console.log('Admin já existe!');
  process.exit(0);
}

const password = await bcrypt.hash('admin123', 10);

await User.create({
  name: 'Admin',
  email: 'admin@restaurant.com',
  password,
  role: 'ADMIN',
  active: true,
  isSuperAdmin: true, // ← primeiro admin sempre é superadmin
});

console.log('✅ SuperAdmin criado com sucesso!');
console.log('   Email: admin@restaurant.com');
console.log('   Senha: admin123');
console.log('   ⚠️  Troque a senha após o primeiro login!');

process.exit(0);