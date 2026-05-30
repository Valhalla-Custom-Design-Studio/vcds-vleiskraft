/**
 * formatZAR — Format a number as South African Rand (ZAR)
 * Returns "—" for zero, null, or undefined prices (out-of-stock / unpriced items)
 */
export const formatZAR = (amount: number | null | undefined, inCents = false): string => {
  if (amount === null || amount === undefined || amount === 0) return '—';
  const value = inCents ? amount / 100 : amount;
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * formatZARRange — Format a price range e.g. "R99 – R499/month"
 */
export const formatZARRange = (min: number, max: number, period = 'month'): string => {
  return `${formatZAR(min)} – ${formatZAR(max)}/${period}`;
};

/**
 * formatZARAccessible — Returns screen-reader-friendly string
 */
export const formatZARAccessible = (amount: number): string => {
  if (!amount) return 'prys nie beskikbaar nie';
  return `${amount.toFixed(2)} rand`;
};

/**
 * isPriced — Returns true if a product has a valid, non-zero price
 */
export const isPriced = (amount: number | null | undefined): boolean => {
  return amount !== null && amount !== undefined && amount > 0;
};
