import {settings, SettingsStore} from '@/store/settings';
import {PREFERRED_LOCALE} from '@/utils/locale';

function getDeterminedLocale(state: SettingsStore) {
  let numberingSystem = state.NUMBERING_SYSTEM
    ? '-u-nu-' + state.NUMBERING_SYSTEM
    : '';
  return state.SELECTED_LOCALE + numberingSystem;
}

let IS_24_HOUR_FORMAT = settings.getState().IS_24_HOUR_FORMAT;
let NUMBERING_SYSTEM = settings.getState().NUMBERING_SYSTEM;
let SELECTED_LOCALE = getDeterminedLocale(settings.getState());
let SELECTED_ARABIC_CALENDAR = settings.getState().SELECTED_ARABIC_CALENDAR;

settings.subscribe(state => {
  IS_24_HOUR_FORMAT = state.IS_24_HOUR_FORMAT;
  NUMBERING_SYSTEM = state.NUMBERING_SYSTEM;
  SELECTED_LOCALE = getDeterminedLocale(state);
  SELECTED_ARABIC_CALENDAR = state.SELECTED_ARABIC_CALENDAR;
});

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
  return new Intl.DateTimeFormat(SELECTED_LOCALE, {
    weekday: length,
  }).format(date);
}

export function getMonthName(date: Date) {
  return new Intl.DateTimeFormat(SELECTED_LOCALE, {
    month: 'long',
  }).format(date);
}

export function getDay(date: Date) {
  return new Intl.DateTimeFormat(SELECTED_LOCALE, {
    day: '2-digit',
  }).format(date);
}

export function getTime(date: Date) {
  if (IS_24_HOUR_FORMAT) {
    return new Intl.DateTimeFormat(SELECTED_LOCALE, {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } else {
    return new Intl.DateTimeFormat(SELECTED_LOCALE, {
      hour12: true,
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  }
}

export function getArabicDate(date: Date) {
  let calendar;

  if (SELECTED_ARABIC_CALENDAR) {
    calendar = SELECTED_ARABIC_CALENDAR;
  } else {
    calendar =
      PREFERRED_LOCALE === 'ar-SA' ? 'islamic-umalqura' : 'islamic-civil';
  }

  let numbering = '-nu-arab';
  if (NUMBERING_SYSTEM) {
    numbering = `-nu-${NUMBERING_SYSTEM}`;
  }
  return new Intl.DateTimeFormat(`ar-u-ca-${calendar}${numbering}`, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  }).format(date);
}
