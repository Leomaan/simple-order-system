import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { sequelize } from '../src/models/index.js';
import User from '../src/models/user.js'; 

const isProduction = process.env.NODE_ENV === 'production';

async function runSeed() {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco estabelecida.');

    if (!isProduction) {
      await sequelize.sync(); 
    }

    const adminEmail = 'admin@restaurant.com';

    const exists = await User.findOne({ where: { email: adminEmail } });

    if (exists) {
      console.log('SuperAdmin já existe no banco. O script foi ignorado.');
      process.exit(0);
    }

    const password = await bcrypt.hash('admin123', 10);

    await User.create({
      name: 'Admin Master',
      email: adminEmail,
      password,
      role: 'ADMIN',
      active: true,
      isSuperAdmin: true,
    });

    console.log('SuperAdmin criado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao tentar criar o Admin:', error);
    process.exit(1);
  }
}

runSeed();