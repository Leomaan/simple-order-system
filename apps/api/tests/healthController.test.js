import { describe, it, expect, vi } from 'vitest';
import { checkHealth } from '../src/controllers/healthController.js';
import { sequelize } from '../src/models/index.js';

vi.mock('../src/models/index.js', () => ({
  sequelize: {
    authenticate: vi.fn()
  }
}));

describe('healthController', () => {
  it('deve retornar status OK e database connected quando o banco responde (200)', async () => {
    sequelize.authenticate.mockResolvedValueOnce(true);
    const req = {};
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    await checkHealth(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      status: 'OK',
      database: 'connected'
    }));
  });

  it('deve retornar status ERROR e database disconnected se o banco falhar (500)', async () => {
    sequelize.authenticate.mockRejectedValueOnce(new Error('DB Connection Refused'));
    const req = {};
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    await checkHealth(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      status: 'ERROR',
      database: 'disconnected'
    }));
  });
});
