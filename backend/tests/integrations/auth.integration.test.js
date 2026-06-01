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

describe('POST /auth/login', () => {
  it('deve retornar token com credenciais válidas', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'admin123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
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

    const { refreshToken } = loginRes.body.data;

    const res = await request(app)
      .post('/auth/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('accessToken');
  });

  it('deve retornar 401 com refresh token inválido', async () => {
    const res = await request(app)
      .post('/auth/refresh')
      .send({ refreshToken: 'token_invalido' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('deve retornar 400 sem refresh token', async () => {
    const res = await request(app)
      .post('/auth/refresh')
      .send({});

    expect(res.status).toBe(400);
  });
});

describe('POST /auth/logout', () => {
  it('deve fazer logout com sucesso', async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'admin123' });

    const { refreshToken, accessToken } = loginRes.body.data;

    const res = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('deve retornar 400 sem refresh token', async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'admin123' });

    const res = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${loginRes.body.data.accessToken}`)
      .send({});

    expect(res.status).toBe(400);
  });
});