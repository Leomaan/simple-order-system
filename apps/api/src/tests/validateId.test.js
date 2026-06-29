import { describe, it, expect, vi } from 'vitest';
import { validateId } from '../middleware/validateId.js';
import { AppError } from '../middleware/appError.js';

function mockReq(id) {
  return { params: { id } };
}

const res = {};
const next = vi.fn();

describe('validateId', () => {
  it('deve passar com id válido', () => {
    const req = mockReq('1');
    validateId(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.params.id).toBe(1);
  });

  it('deve lançar AppError se id for negativo', () => {
    expect(() => validateId(mockReq('-1'), res, next)).toThrow(AppError);
  });

  it('deve lançar AppError se id for zero', () => {
    expect(() => validateId(mockReq('0'), res, next)).toThrow(AppError);
  });

  it('deve lançar AppError se id for texto', () => {
    expect(() => validateId(mockReq('abc'), res, next)).toThrow(AppError);
  });

  it('deve lançar AppError se id for decimal', () => {
    expect(() => validateId(mockReq('1.5'), res, next)).toThrow(AppError);
  });
});