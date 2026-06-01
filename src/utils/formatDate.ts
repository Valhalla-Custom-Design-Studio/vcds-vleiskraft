import { format, parseISO, isValid } from 'date-fns';
import { af as afLocale, enZA } from 'date-fns/locale';

export type SupportedLocale = 'en' | 'af';

const LOCALES = { en: enZA, af: afLocale };

/**
 * formatDate  -  Format a date in SA format (DD/MM/YYYY)
 * @param date - ISO string or Date object
 * @param locale - 'en' or 'af'
 * @param pattern - date-fns format pattern (default: dd/MM/yyyy)
 */
export const formatDate = (
  date: string | Date,
  locale: SupportedLocale = 'en',
  pattern = 'dd/MM/yyyy'
): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return 'Invalid date';
  return format(d, pattern, { locale: LOCALES[locale] });
};

/**
 * formatDateTime  -  DD/MM/YYYY HH:mm
 */
export const formatDateTime = (date: string | Date, locale: SupportedLocale = 'en'): string => {
  return formatDate(date, locale, 'dd/MM/yyyy HH:mm');
};

/**
 * formatRelative  -  "2 days ago", "in 3 hours" etc.
 */
export const formatRelativeDate = (date: string | Date, locale: SupportedLocale = 'en'): string => {
  const { formatDistanceToNow } = require('date-fns');
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: LOCALES[locale] });
};
