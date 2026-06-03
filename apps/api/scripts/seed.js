import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { sequelize } from '../src/models/index.js';
import User from '../src/models/user.js';

async function seed() {
  try {
    await sequelize.authenticate(); 

    await sequelize.sync(); 

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@restaurant.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const exists = await User.findOne({ where: { email: adminEmail } });

    if (exists) {
      console.log('ℹ️  Admin já existe no sistema.');
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await User.create({
      name: 'Admin do Sistema',
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      active: true,
    });

    console.log('✅ Admin criado com sucesso!');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Senha: ${adminPassword}`);
  } catch (error) {
    console.error('❌ Erro ao criar admin:', error.message);
  } finally {
    await sequelize.close(); 
    process.exit(0);
  }
}

seed();