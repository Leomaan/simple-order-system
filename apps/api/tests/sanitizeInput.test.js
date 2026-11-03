import { describe, it, expect } from 'vitest';
import { sanitizeString, sanitizeData, sanitizeInput } from '../src/middleware/sanitizeInput.js';

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

  describe('sanitizeData (recursivo)', () => {
    it('deve sanitizar objetos com múltiplos níveis', () => {
      const input = {
        name: '<b>Hambúrguer</b>',
        description: '<script>alert(1)</script>Delicioso',
        price: 35.5,
        available: true,
        nested: {
          notes: '<img src=x onerror=alert(2)>Sem salada',
        },
      };

      const result = sanitizeData(input);

      expect(result).toEqual({
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
      expect(sanitizeData(input)).toEqual(['item 1', 'item 2']);
    });

    it('deve proteger contra prototype pollution descartando chaves perigosas', () => {
      const malicious = JSON.parse('{"__proto__": {"polluted": true}, "name": "Teste"}');
      const sanitized = sanitizeData(malicious);

      expect(sanitized.__proto__.polluted).toBeUndefined();
      expect(sanitized.name).toBe('Teste');
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
  });
});
