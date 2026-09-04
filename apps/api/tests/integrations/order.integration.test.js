import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { setupTestDb, teardownTestDb, createAdminUser, createWaiterUser, getAdminToken, getWaiterToken } from './helpers.js';
import Product from '../../src/models/product.js';

let adminToken;
let waiterToken;
let orderId;
let productId;

beforeAll(async () => {
  await setupTestDb();
  await createAdminUser();
  await createWaiterUser();
  adminToken = await getAdminToken(request, app);
  waiterToken = await getWaiterToken(request, app);

  // cria produto para usar nos testes de order-item
  const product = await Product.create({
    name: 'X-Burguer',
    price: 25.90,
    category: 'FOOD',
    available: true,
  });
  productId = product.id;
});

afterAll(async () => {
  await teardownTestDb();
});

// ─── POST /order ───────────────────────────────────────────
describe('POST /order', () => {
  it('garçom deve criar pedido com sucesso', async () => {
    const res = await request(app)
      .post('/order')
      .set('Authorization', `Bearer ${waiterToken}`)
      .send({ table: 5 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.table).toBe(5);
    orderId = res.body.data.id;
  });

  it('deve retornar 400 se mesa já tiver pedido aberto', async () => {
    const res = await request(app)
      .post('/order')
      .set('Authorization', `Bearer ${waiterToken}`)
      .send({ table: 5 });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('there is already an open order for this table');
  });

  it('deve retornar 400 sem mesa', async () => {
    const res = await request(app)
      .post('/order')
      .set('Authorization', `Bearer ${waiterToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('deve retornar 401 sem token', async () => {
    const res = await request(app)
      .post('/order')
      .send({ table: 9 });

    expect(res.status).toBe(401);
  });
});

// ─── GET /order ────────────────────────────────────────────
describe('GET /order', () => {
  it('deve listar todos os pedidos', async () => {
    const res = await request(app)
      .get('/order')
      .set('Authorization', `Bearer ${waiterToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('deve filtrar pedidos por status', async () => {
    const res = await request(app)
      .get('/order?status=OPEN')
      .set('Authorization', `Bearer ${waiterToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.every(o => o.status === 'OPEN')).toBe(true);
  });

  it('deve retornar 400 com status inválido', async () => {
    const res = await request(app)
      .get('/order?status=INVALIDO')
      .set('Authorization', `Bearer ${waiterToken}`);

    expect(res.status).toBe(400);
  });
});

// ─── GET /order/:id ────────────────────────────────────────
describe('GET /order/:id', () => {
  it('deve retornar pedido por id com itens', async () => {
    const res = await request(app)
      .get(`/order/${orderId}`)
      .set('Authorization', `Bearer ${waiterToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(orderId);
    expect(res.body.data).toHaveProperty('total');
  });

  it('deve retornar 404 se pedido não existir', async () => {
    const res = await request(app)
      .get('/order/9999')
      .set('Authorization', `Bearer ${waiterToken}`);

    expect(res.status).toBe(404);
  });
});

// ─── POST /order-item ──────────────────────────────────────
describe('POST /order-item', () => {
  it('garçom deve adicionar item ao pedido', async () => {
    const res = await request(app)
      .post('/order-item')
      .set('Authorization', `Bearer ${waiterToken}`)
      .send({ orderId, productId, quantity: 2 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('deve somar quantidade se item já existir', async () => {
    const res = await request(app)
      .post('/order-item')
      .set('Authorization', `Bearer ${waiterToken}`)
      .send({ orderId, productId, quantity: 3 });

    expect(res.status).toBe(200);
    expect(res.body.data.quantity).toBe(5);
  });
});

// ─── PATCH /order/:id/close ────────────────────────────────
describe('PATCH /order/:id/close', () => {
  it('garçom deve fechar pedido com itens', async () => {
    const res = await request(app)
      .patch(`/order/${orderId}/close`)
      .set('Authorization', `Bearer ${waiterToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('deve retornar 400 ao tentar fechar pedido já fechado', async () => {
    const res = await request(app)
      .patch(`/order/${orderId}/close`)
      .set('Authorization', `Bearer ${waiterToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('order is already closed');
  });
});

// ─── DELETE /order/:id ─────────────────────────────────────
describe('DELETE /order/:id', () => {
  it('deve fazer soft delete de pedido fechado/pendente por admin', async () => {
    const res = await request(app)
      .delete(`/order/${orderId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('deve fazer soft delete de pedido aberto', async () => {
    const newOrder = await request(app)
      .post('/order')
      .set('Authorization', `Bearer ${waiterToken}`)
      .send({ table: 99 });

    const res = await request(app)
      .delete(`/order/${newOrder.body.data.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it('deve fazer soft delete de pedido pago por admin', async () => {
    const paidOrder = await request(app)
      .post('/order')
      .set('Authorization', `Bearer ${waiterToken}`)
      .send({ table: 77 });
    const paidOrderId = paidOrder.body.data.id;

    await request(app)
      .post('/order-item')
      .set('Authorization', `Bearer ${waiterToken}`)
      .send({ orderId: paidOrderId, productId, quantity: 1 });

    await request(app)
      .patch(`/order/${paidOrderId}/close`)
      .set('Authorization', `Bearer ${waiterToken}`);

    await request(app)
      .post(`/payment/manual/${paidOrderId}`)
      .set('Authorization', `Bearer ${waiterToken}`)
      .send({ paymentMethod: 'CASH' });

    const res = await request(app)
      .delete(`/order/${paidOrderId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const trashRes = await request(app)
      .get('/order?onlyDeleted=true')
      .set('Authorization', `Bearer ${adminToken}`);

    const foundInTrash = trashRes.body.data.find(o => o.id === paidOrderId);
    expect(foundInTrash).toBeDefined();
    expect(Number(foundInTrash.total)).toBe(26);
  });
});

// ─── PATCH /order/:id/restore ──────────────────────────────
describe('PATCH /order/:id/restore', () => {
  it('admin deve restaurar pedido deletado', async () => {
    const newOrder = await request(app)
      .post('/order')
      .set('Authorization', `Bearer ${waiterToken}`)
      .send({ table: 88 });

    await request(app)
      .delete(`/order/${newOrder.body.data.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    const res = await request(app)
      .patch(`/order/${newOrder.body.data.id}/restore`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});