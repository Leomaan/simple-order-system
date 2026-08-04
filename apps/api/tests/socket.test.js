import { describe, it, expect, vi } from 'vitest';
import { emitEvent, getIO } from '../src/util/socket.js';

describe('socket utility', () => {
  it('não deve lançar erro ao emitir evento com io não inicializado', () => {
    expect(() => emitEvent('test:event', { foo: 'bar' })).not.toThrow();
  });

  it('deve retornar null se getIO for chamado antes de initSocket', () => {
    expect(getIO()).toBeNull();
  });
});
