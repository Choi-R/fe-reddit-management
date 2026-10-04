// Self-check for currency formatting logic (no dependencies, assert-based)
import assert from 'assert';

function formatCurrency(amount, is_indonesian) {
  const num = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0);
  if (isNaN(num)) {
    return is_indonesian ? '0k' : '$0.00';
  }

  if (is_indonesian) {
    const idrInK = num * 15;
    const rounded = Math.round(idrInK * 100) / 100;
    const parts = rounded.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${parts.join('.')}k`;
  }

  return `$${num.toFixed(2)}`;
}

// 1. Indonesian account tests (1 USD = 15k IDR)
assert.strictEqual(formatCurrency(3, true), '45k', '3 USD should be 45k');
assert.strictEqual(formatCurrency('3.00', true), '45k', '"3.00" USD should be 45k');
assert.strictEqual(formatCurrency(1, true), '15k', '1 USD should be 15k');
assert.strictEqual(formatCurrency(0, true), '0k', '0 USD should be 0k');
assert.strictEqual(formatCurrency(0.5, true), '7.5k', '0.5 USD should be 7.5k');
assert.strictEqual(formatCurrency(2.5, true), '37.5k', '2.5 USD should be 37.5k');
assert.strictEqual(formatCurrency(100, true), '1,500k', '100 USD should be 1,500k');

// 2. Non-Indonesian account tests (standard USD)
assert.strictEqual(formatCurrency(3, false), '$3.00', '3 USD should be $3.00');
assert.strictEqual(formatCurrency('3.00', false), '$3.00', '"3.00" USD should be $3.00');
assert.strictEqual(formatCurrency(0, false), '$0.00', '0 USD should be $0.00');
assert.strictEqual(formatCurrency(2.5, undefined), '$2.50', '2.5 USD default should be $2.50');

console.log('All currency self-checks passed successfully!');
