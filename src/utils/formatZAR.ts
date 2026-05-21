/**
 * formatZAR — Format a number as South African Rand (ZAR)
 * WCAG: Always use text label alongside currency symbol for screen readers
 * @param amount - Amount in cents (integer) or rands (float)
 * @param inCents - If true, divides by 100 first (default: false)
 */
export const formatZAR = (amount: number, inCents = false): string => {
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
 * e.g. "R 1 500,00" → "1500 rand"
 */
export const formatZARAccessible = (amount: number): string => {
  return `${amount.toFixed(2)} rand`;
};
