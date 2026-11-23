import { formatAmount, parseAmount } from './TransactionList';

describe('TransactionList - Amount Formatting', () => {
  describe('formatAmount', () => {
    test('formats integer amount with trailing zeros', () => {
      const result = formatAmount(10);
      expect(result).toBe('$10.00');
    });

    test('formats decimal amount with trailing zeros', () => {
      const result = formatAmount(10.5);
      expect(result).toBe('$10.50');
    });

    test('formats large amount', () => {
      const result = formatAmount(1234.56);
      expect(result).toBe('$1234.56');
    });

    test('handles zero', () => {
      const result = formatAmount(0);
      expect(result).toBe('$0.00');
    });
  });

  describe('parseAmount', () => {
    test('parses string with leading zeros', () => {
      const result = parseAmount('010.50');
      expect(result).toBe(10.5);
    });

    test('parses string with multiple leading zeros', () => {
      const result = parseAmount('00123.45');
      expect(result).toBe(123.45);
    });

    test('parses normal string', () => {
      const result = parseAmount('10.50');
      expect(result).toBe(10.5);
    });

    test('parses integer string', () => {
      const result = parseAmount('10');
      expect(result).toBe(10);
    });

    test('handles null input', () => {
      const result = parseAmount(null);
      expect(result).toBe(0);
    });

    test('handles undefined input', () => {
      const result = parseAmount(undefined);
      expect(result).toBe(0);
    });

    test('handles empty string', () => {
      const result = parseAmount('');
      expect(result).toBe(0);
    });
  });
});
