import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { setupTestDb, teardownTestDb, createAdminUser } from './helpers.js';

beforeAll(async () => {
  await setupTestDb();
  await createAdminUser();
});

afterAll(async () => {
  await teardownTestDb();
});

function extractCookieValue(setCookieHeader, cookieName) {
  if (!setCookieHeader) return null;
  const cookieStr = setCookieHeader.find(c => c.startsWith(`${cookieName}=`));
  if (!cookieStr) return null;
  return cookieStr.split(';')[0].split('=')[1];
}

describe('POST /auth/login', () => {
  it('deve retornar token com credenciais válidas', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'admin123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some(c => c.startsWith('accessToken='))).toBe(true);
    expect(cookies.some(c => c.startsWith('refreshToken='))).toBe(true);
    expect(res.body.data.role).toBe('ADMIN');
  });

  it('deve retornar 401 com senha incorreta', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'errada' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('credenciais inválidas');
  });

  it('deve retornar 401 com email inexistente', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'naoexiste@test.com', password: 'admin123' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('deve retornar 400 sem email', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ password: 'admin123' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('deve retornar 400 com email inválido', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'emailinvalido', password: 'admin123' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /auth/refresh', () => {
  it('deve retornar novo accessToken com refresh token válido', async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'admin123' });

    const refreshToken = extractCookieValue(loginRes.headers['set-cookie'], 'refreshToken');

    const res = await request(app)
      .post('/auth/refresh')
      .set('Cookie', [`refreshToken=${refreshToken}`])
      .send({});

    expect(res.status).toBe(200);
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some(c => c.startsWith('accessToken='))).toBe(true);
  });

  it('deve retornar 401 com refresh token inválido', async () => {
    const res = await request(app)
      .post('/auth/refresh')
      .set('Cookie', ['refreshToken=token_invalido'])
      .send({});

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('deve retornar 400 sem refresh token', async () => {
    const res = await request(app)
      .post('/auth/refresh')
      .send({});

    expect(res.status).toBe(401);
  });
});

describe('POST /auth/logout', () => {
  it('deve fazer logout com sucesso', async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'admin123' });

    const refreshToken = extractCookieValue(loginRes.headers['set-cookie'], 'refreshToken');
    const accessToken = extractCookieValue(loginRes.headers['set-cookie'], 'accessToken');

    const res = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', [`refreshToken=${refreshToken}`])
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('deve retornar 400 sem refresh token', async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'admin123' });

    const accessToken = extractCookieValue(loginRes.headers['set-cookie'], 'accessToken');

    const res = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({});

    expect(res.status).toBe(400);
  });
});