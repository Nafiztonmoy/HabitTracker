import { formatCurrency, formatMinutes } from './formatters';

test('formats recovered time naturally', () => {
  expect(formatMinutes(45)).toBe('45 min');
  expect(formatMinutes(90)).toBe('1h 30m');
  expect(formatMinutes(1440)).toBe('24h');
});

test('formats BDT currency without losing the amount', () => {
  const formatted = formatCurrency(1250);
  expect(formatted).toBe('৳1,250');
});
