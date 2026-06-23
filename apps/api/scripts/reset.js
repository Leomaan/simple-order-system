import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { sequelize } from '../src/models/index.js';
import User from '../src/models/user.js';

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  console.error('🚨 ERRO CRÍTICO: Tentativa de resetar o banco em PRODUÇÃO bloqueada!');
  process.exit(1);
}

async function runReset() {
  try {
    console.log('Iniciando o reset do banco de dados (Ambiente de Desenvolvimento)');

    await sequelize.sync({ force: true });
    console.log('Banco de dados limpo e tabelas recriadas!');

    const password = await bcrypt.hash('admin123', 10);
    
    await User.create({
      name: 'Admin Master',
      email: 'admin@restaurant.com',
      password,
      role: 'ADMIN',
      active: true,
      isSuperAdmin: true,
    });

    console.log('SuperAdmin recriado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao resetar o banco:', error);
    process.exit(1);
  }
}

runReset();