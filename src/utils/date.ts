import {PREFERRED_LOCALE} from '@/utils/locale';

const oneDayInMs = 86400 * 1000;

export function getNextDayBeginning(date: Date) {
  const beginningOfToday = new Date(date.valueOf());
  beginningOfToday.setHours(0, 0, 0, 0);

  return new Date(beginningOfToday.valueOf() + oneDayInMs);
}

export function addDays(date: Date, days: number) {
  return new Date(date.valueOf() + days * oneDayInMs);
}

export function getDayName(date: Date, length: 'long' | 'short' = 'long') {
  return new Intl.DateTimeFormat(PREFERRED_LOCALE, {
    weekday: length,
  }).format(date);
}

export function getMonthName(date: Date) {
  return new Intl.DateTimeFormat(PREFERRED_LOCALE, {month: 'long'}).format(
    date,
  );
}

export function getDay(date: Date) {
  return new Intl.DateTimeFormat(PREFERRED_LOCALE, {day: '2-digit'}).format(
    date,
  );
}

export function getTime24(date: Date) {
  return new Intl.DateTimeFormat(PREFERRED_LOCALE, {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
