import { describe, it, expect } from 'vitest';
import { sanitizeString, sanitizeInPlace, sanitizeInput } from '../src/middleware/sanitizeInput.js';

describe('sanitizeInput middleware & utils', () => {
  describe('sanitizeString', () => {
    it('deve remover tags HTML simples', () => {
      expect(sanitizeString('<b>Negrito</b>')).toBe('Negrito');
      expect(sanitizeString('<h1>Título</h1> e texto')).toBe('Título e texto');
    });

    it('deve remover scripts perigosos completamente', () => {
      expect(sanitizeString('<script>alert("xss")</script>Sem cebola')).toBe('Sem cebola');
      expect(sanitizeString('<SCRIPT SRC="http://evil.com/xss.js"></SCRIPT>Batata')).toBe('Batata');
    });

    it('deve remover tags com event handlers como img onerror ou svg onload', () => {
      expect(sanitizeString('<img src=x onerror=alert(1)>Observação')).toBe('Observação');
      expect(sanitizeString('<svg onload="fetch(\'/hack\')">')).toBe('');
    });

    it('deve remover protocolos maliciosos como javascript:', () => {
      expect(sanitizeString('javascript:alert(1)')).toBe('alert(1)');
    });

    it('deve remover caracteres nulos \\0', () => {
      expect(sanitizeString('Texto\0com\0nulo')).toBe('Textocomnulo');
    });

    it('deve preservar senhas com caracteres especiais intactas', () => {
      const password = 'MinhaSenha<Forte>!@#123';
      expect(sanitizeString(password, 'password')).toBe(password);
      expect(sanitizeString(password, 'newPassword')).toBe(password);
      expect(sanitizeString(password, 'confirmPassword')).toBe(password);
    });

    it('deve fazer trim de espaços no início e final', () => {
      expect(sanitizeString('   Sem tomate   ')).toBe('Sem tomate');
    });
  });

  describe('sanitizeInPlace (recursivo)', () => {
    it('deve sanitizar objetos com múltiplos níveis in-place', () => {
      const input = {
        name: '<b>Hambúrguer</b>',
        description: '<script>alert(1)</script>Delicioso',
        price: 35.5,
        available: true,
        nested: {
          notes: '<img src=x onerror=alert(2)>Sem salada',
        },
      };

      sanitizeInPlace(input);

      expect(input).toEqual({
        name: 'Hambúrguer',
        description: 'Delicioso',
        price: 35.5,
        available: true,
        nested: {
          notes: 'Sem salada',
        },
      });
    });

    it('deve sanitizar arrays de strings e de objetos', () => {
      const input = ['<script>xss</script>item 1', '<i>item 2</i>'];
      sanitizeInPlace(input);
      expect(input).toEqual(['item 1', 'item 2']);
    });

    it('deve proteger contra prototype pollution descartando chaves perigosas', () => {
      const malicious = JSON.parse('{"__proto__": {"polluted": true}, "name": "Teste"}');
      sanitizeInPlace(malicious);

      expect(malicious.__proto__.polluted).toBeUndefined();
      expect(malicious.name).toBe('Teste');
    });
  });

  describe('sanitizeInput middleware Express', () => {
    it('deve sanitizar req.body, req.query e req.params e chamar next', () => {
      const req = {
        body: {
          notes: '<script>evil()</script>Bem passado',
          password: 'P@ss<word>',
        },
        query: {
          search: '<b>pizza</b>',
        },
        params: {
          id: '123',
        },
      };

      const res = {};
      let called = false;
      const next = () => { called = true; };

      sanitizeInput(req, res, next);

      expect(called).toBe(true);
      expect(req.body.notes).toBe('Bem passado');
      expect(req.body.password).toBe('P@ss<word>'); // preservada
      expect(req.query.search).toBe('pizza');
      expect(req.params.id).toBe('123');
    });

    it('deve sanitizar req.query quando ela for uma propriedade getter-only do Express 5 sem lançar erro', () => {
      const queryTarget = { search: '<b>pizza</b>' };
      const req = {
        body: {},
        params: {},
        get query() {
          return queryTarget;
        },
        set query(_) {
          throw new TypeError('Cannot set property query of #<IncomingMessage> which has only a getter');
        },
      };

      const res = {};
      let called = false;
      const next = () => { called = true; };

      expect(() => sanitizeInput(req, res, next)).not.toThrow();
      expect(called).toBe(true);
      expect(req.query.search).toBe('pizza');
    });
  });
});
