import { sequelize } from '../../src/models/index.js';
import User from '../../src/models/user.js';
import bcrypt from 'bcryptjs';

export async function setupTestDb() {
  await sequelize.sync({ force: true });
}

export async function teardownTestDb() {
  await sequelize.close();
}

export async function createAdminUser() {
  const password = await bcrypt.hash('admin123', 10);
  return User.create({
    name: 'Admin Test',
    email: 'admin@test.com',
    password,
    role: 'ADMIN',
    active: true,
  });
}

export async function createWaiterUser() {
  const password = await bcrypt.hash('waiter123', 10);
  return User.create({
    name: 'Waiter Test',
    email: 'waiter@test.com',
    password,
    role: 'WAITER',
    active: true,
  });
}

function extractCookieValue(setCookieHeader, cookieName) {
  if (!setCookieHeader) return null;
  const cookieStr = setCookieHeader.find(c => c.startsWith(`${cookieName}=`));
  if (!cookieStr) return null;
  return cookieStr.split(';')[0].split('=')[1];
}

export async function getAdminToken(request, app) {
  const res = await request(app)
    .post('/auth/login')
    .send({ email: 'admin@test.com', password: 'admin123' });
  return extractCookieValue(res.headers['set-cookie'], 'accessToken');
}

export async function getWaiterToken(request, app) {
  const res = await request(app)
    .post('/auth/login')
    .send({ email: 'waiter@test.com', password: 'waiter123' });
  return extractCookieValue(res.headers['set-cookie'], 'accessToken');
}