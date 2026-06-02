import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { setupTestDb, teardownTestDb, createAdminUser, createWaiterUser, getAdminToken, getWaiterToken } from './helpers.js';

let adminToken;
let waiterToken;
let userId;

beforeAll(async () => {
  await setupTestDb();
  await createAdminUser();
  await createWaiterUser();
  adminToken = await getAdminToken(request, app);
  waiterToken = await getWaiterToken(request, app);
});

afterAll(async () => {
  await teardownTestDb();
});

// ─── POST /user ────────────────────────────────────────────
describe('POST /user', () => {
  it('admin deve criar usuário com sucesso', async () => {
    const res = await request(app)
      .post('/user')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'João', email: 'joao@test.com', password: 'senha123', role: 'WAITER' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).not.toHaveProperty('password');
    userId = res.body.data.id;
  });

  it('deve retornar 400 se email já cadastrado', async () => {
    const res = await request(app)
      .post('/user')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'João', email: 'joao@test.com', password: 'senha123', role: 'WAITER' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('email já cadastrado');
  });

  it('deve retornar 400 sem campos obrigatórios', async () => {
    const res = await request(app)
      .post('/user')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Teste' });

    expect(res.status).toBe(400);
  });

  it('deve retornar 403 se garçom tentar criar usuário', async () => {
    const res = await request(app)
      .post('/user')
      .set('Authorization', `Bearer ${waiterToken}`)
      .send({ name: 'Teste', email: 'teste@test.com', password: 'senha123', role: 'WAITER' });

    expect(res.status).toBe(403);
  });
});

// ─── GET /user ─────────────────────────────────────────────
describe('GET /user', () => {
  it('admin deve listar todos os usuários', async () => {
    const res = await request(app)
      .get('/user')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0]).not.toHaveProperty('password');
  });

  it('deve retornar 403 se garçom tentar listar usuários', async () => {
    const res = await request(app)
      .get('/user')
      .set('Authorization', `Bearer ${waiterToken}`);

    expect(res.status).toBe(403);
  });
});

// ─── GET /user/:id ─────────────────────────────────────────
describe('GET /user/:id', () => {
  it('admin deve buscar usuário por id', async () => {
    const res = await request(app)
      .get(`/user/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(userId);
  });

  it('deve retornar 404 se usuário não existir', async () => {
    const res = await request(app)
      .get('/user/9999')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});

// ─── PATCH /user/:id ───────────────────────────────────────
describe('PATCH /user/:id', () => {
  it('admin deve atualizar usuário com sucesso', async () => {
    const res = await request(app)
      .patch(`/user/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'João Silva' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('João Silva');
  });

  it('admin não deve poder desativar a si mesmo', async () => {
    const adminRes = await request(app)
      .get('/user')
      .set('Authorization', `Bearer ${adminToken}`);

    const adminId = adminRes.body.data.find(u => u.role === 'ADMIN').id;

    const res = await request(app)
      .patch(`/user/${adminId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ active: false });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('você não pode desativar sua própria conta');
  });
});

// ─── DELETE /user/:id ──────────────────────────────────────
describe('DELETE /user/:id', () => {
  it('admin deve fazer soft delete do usuário', async () => {
    const res = await request(app)
      .delete(`/user/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('usuário deletado não deve aparecer na listagem', async () => {
    const res = await request(app)
      .get('/user')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.body.data.find(u => u.id === userId)).toBeUndefined();
  });
});

// ─── PATCH /user/:id/restore ───────────────────────────────
describe('PATCH /user/:id/restore', () => {
  it('admin deve restaurar usuário deletado', async () => {
    const res = await request(app)
      .patch(`/user/${userId}/restore`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('usuário restaurado deve aparecer na listagem', async () => {
    const res = await request(app)
      .get('/user')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.body.data.find(u => u.id === userId)).toBeDefined();
  });
});

// ─── DELETE /user/:id/permanent ────────────────────────────
describe('DELETE /user/:id/permanent', () => {
  it('admin deve deletar usuário permanentemente', async () => {
    const res = await request(app)
      .delete(`/user/${userId}/permanent`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('admin não pode deletar a si mesmo', async () => {
    const adminRes = await request(app)
      .get('/user')
      .set('Authorization', `Bearer ${adminToken}`);

    const adminId = adminRes.body.data.find(u => u.role === 'ADMIN').id;

    const res = await request(app)
      .delete(`/user/${adminId}/permanent`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
  });
});