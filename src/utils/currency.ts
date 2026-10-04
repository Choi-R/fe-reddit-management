/**
 * Formats monetary amounts for the platform.
 * 
 * If is_indonesian is true, converts USD amount to IDR using the hardcoded 15k rate (1 USD = 15k IDR).
 * Example: $3 becomes 45k.
 * If is_indonesian is false/undefined, formats as USD with dollar sign and two decimal places ($3.00).
 */
export function formatCurrency(amount: number | string | null | undefined, is_indonesian?: boolean): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0);
  if (isNaN(num)) {
    return is_indonesian ? '0k' : '$0.00';
  }

  if (is_indonesian) {
    const idrInK = num * 15;
    // Round to max 2 decimal places to avoid floating point anomalies (e.g. 7.500000000000001)
    const rounded = Math.round(idrInK * 100) / 100;
    const parts = rounded.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${parts.join('.')}k`;
  }

  return `$${num.toFixed(2)}`;
}
