import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { setupTestDb, teardownTestDb, createAdminUser, createWaiterUser, getAdminToken, getWaiterToken } from './helpers.js';

let adminToken;
let waiterToken;
let productId;

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

// ─── POST /product ─────────────────────────────────────────
describe('POST /product', () => {
  it('admin deve criar produto com sucesso', async () => {
    const res = await request(app)
      .post('/product')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'X-Burguer', price: 25.90, category: 'FOOD' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.name).toBe('X-Burguer');
    productId = res.body.data.id;
  });

  it('deve retornar 403 se garçom tentar criar produto', async () => {
    const res = await request(app)
      .post('/product')
      .set('Authorization', `Bearer ${waiterToken}`)
      .send({ name: 'Suco', price: 10, category: 'DRINK' });

    expect(res.status).toBe(403);
  });

  it('deve retornar 400 sem campos obrigatórios', async () => {
    const res = await request(app)
      .post('/product')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 25.90 });

    expect(res.status).toBe(400);
  });

  it('deve retornar 401 sem token', async () => {
    const res = await request(app)
      .post('/product')
      .send({ name: 'Teste', price: 10, category: 'FOOD' });

    expect(res.status).toBe(401);
  });
});

// ─── GET /product ──────────────────────────────────────────
describe('GET /product', () => {
  it('deve listar todos os produtos', async () => {
    const res = await request(app)
      .get('/product')
      .set('Authorization', `Bearer ${waiterToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('deve filtrar por categoria', async () => {
    const res = await request(app)
      .get('/product?category=FOOD')
      .set('Authorization', `Bearer ${waiterToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.every(p => p.category === 'FOOD')).toBe(true);
  });

  it('deve retornar 400 com categoria inválida', async () => {
    const res = await request(app)
      .get('/product?category=INVALIDA')
      .set('Authorization', `Bearer ${waiterToken}`);

    expect(res.status).toBe(400);
  });
});

// ─── GET /product/:id ──────────────────────────────────────
describe('GET /product/:id', () => {
  it('deve retornar produto por id', async () => {
    const res = await request(app)
      .get(`/product/${productId}`)
      .set('Authorization', `Bearer ${waiterToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(productId);
  });

  it('deve retornar 404 se produto não existir', async () => {
    const res = await request(app)
      .get('/product/9999')
      .set('Authorization', `Bearer ${waiterToken}`);

    expect(res.status).toBe(404);
  });

  it('deve retornar 400 com id inválido', async () => {
    const res = await request(app)
      .get('/product/-1')
      .set('Authorization', `Bearer ${waiterToken}`);

    expect(res.status).toBe(400);
  });
});

// ─── PUT /product/:id ──────────────────────────────────────
describe('PUT /product/:id', () => {
  it('admin deve atualizar produto com sucesso', async () => {
    const res = await request(app)
      .put(`/product/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'X-Burguer Duplo' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('X-Burguer Duplo');
  });

  it('deve retornar 403 se garçom tentar atualizar', async () => {
    const res = await request(app)
      .put(`/product/${productId}`)
      .set('Authorization', `Bearer ${waiterToken}`)
      .send({ name: 'Teste' });

    expect(res.status).toBe(403);
  });
});

// ─── DELETE /product/:id ───────────────────────────────────
describe('DELETE /product/:id', () => {
  it('admin deve fazer soft delete do produto', async () => {
    const res = await request(app)
      .delete(`/product/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('produto deletado não deve aparecer na listagem', async () => {
    const res = await request(app)
      .get('/product')
      .set('Authorization', `Bearer ${waiterToken}`);

    expect(res.body.data.find(p => p.id === productId)).toBeUndefined();
  });
});

// ─── PATCH /product/:id/restore ────────────────────────────
describe('PATCH /product/:id/restore', () => {
  it('admin deve restaurar produto deletado', async () => {
    const res = await request(app)
      .patch(`/product/${productId}/restore`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('produto restaurado deve aparecer na listagem', async () => {
    const res = await request(app)
      .get('/product')
      .set('Authorization', `Bearer ${waiterToken}`);

    expect(res.body.data.find(p => p.id === productId)).toBeDefined();
  });
});

// ─── DELETE /product/:id/permanent ────────────────────────
describe('DELETE /product/:id/permanent', () => {
  it('admin deve deletar produto permanentemente', async () => {
    const res = await request(app)
      .delete(`/product/${productId}/permanent`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});