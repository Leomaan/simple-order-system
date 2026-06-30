import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { sequelize } from '../models/index.js';
import User from '../models/user.js'; 

const isProduction = process.env.NODE_ENV === 'production';

async function runSeed() {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco estabelecida.');

    if (!isProduction) {
      await sequelize.sync(); 
    }

    const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@restaurant.com';
    const rawPassword = process.env.INITIAL_ADMIN_PASS || 'admin123';

    if (isProduction && (!process.env.INITIAL_ADMIN_EMAIL || !process.env.INITIAL_ADMIN_PASS)) {
      console.error('ERRO: Em produção, as variáveis INITIAL_ADMIN_EMAIL e INITIAL_ADMIN_PASS devem estar definidas no ambiente!');
      process.exit(1);
    }

    const exists = await User.findOne({ where: { email: adminEmail } });

    if (exists) {
      console.log('SuperAdmin já existe no banco. O script foi ignorado.');
      process.exit(0);
    }

    const password = await bcrypt.hash(rawPassword, 10);

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