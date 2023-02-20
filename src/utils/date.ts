import {Platform} from 'react-native';
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
let SELECTED_SECONDARY_CALENDAR =
  settings.getState().SELECTED_SECONDARY_CALENDAR || 'gregory';

settings.subscribe(state => {
  IS_24_HOUR_FORMAT = state.IS_24_HOUR_FORMAT;
  NUMBERING_SYSTEM = state.NUMBERING_SYSTEM;
  SELECTED_LOCALE = getDeterminedLocale(state);
  SELECTED_ARABIC_CALENDAR = state.SELECTED_ARABIC_CALENDAR;
  SELECTED_SECONDARY_CALENDAR = state.SELECTED_SECONDARY_CALENDAR;
});

const oneDayInMs = 86400 * 1000;

export function addDays(date: Date, days: number) {
  return new Date(date.valueOf() + days * oneDayInMs);
}

export function getDayBeginning(date: Date) {
  const beginningOfDay = new Date(date.valueOf());
  beginningOfDay.setHours(0, 0, 0, 0);

  return beginningOfDay;
}

export function getNextDayBeginning(date: Date) {
  return getDayBeginning(addDays(date, 1));
}

export function getPrevDayBeginning(date: Date) {
  return getDayBeginning(addDays(date, -1));
}

export function getMonthBeginning(date: Date) {
  const beginningOfMonth = new Date(date.valueOf());
  beginningOfMonth.setHours(0, 0, 0, 0);
  beginningOfMonth.setDate(1);
  return beginningOfMonth;
}

export function getNextMonthBeginning(date: Date) {
  const beginningOfMonth = new Date(date.valueOf());
  beginningOfMonth.setHours(0, 0, 0, 0);
  beginningOfMonth.setDate(1);
  if (beginningOfMonth.getMonth() === 11) {
    beginningOfMonth.setFullYear(beginningOfMonth.getFullYear() + 1);
    beginningOfMonth.setMonth(0);
  } else {
    beginningOfMonth.setMonth(beginningOfMonth.getMonth() + 1);
  }
  return beginningOfMonth;
}

export function addMonths(date: Date, months: number = 0) {
  const newDate = new Date(date);
  const dateMonth = date.getMonth();
  const sum = months + dateMonth;
  const years = Math.floor(sum / 12);
  const newMonth = sum - years * 12;

  newDate.setFullYear(newDate.getFullYear() + years);
  newDate.setMonth(newMonth);
  return newDate;
}

export function getDayName(date: Date, length: 'long' | 'short' = 'long') {
  return new Intl.DateTimeFormat(SELECTED_LOCALE, {
    weekday: length,
  }).format(date);
}

const persianMonthNames: Record<string, Record<string | number, string>> = {
  en: {
    1: 'Farvardin',
    2: 'Ordibehesht',
    3: 'Khordad',
    4: 'Tir',
    5: 'Mordad',
    6: 'Shahrivar',
    7: 'Mehr',
    8: 'Aban',
    9: 'Azar',
    10: 'Dey',
    11: 'Bahman',
    12: 'Esfand',
  },
  fa: {
    1: 'فروردین',
    2: 'اردیبهشت',
    3: 'خرداد',
    4: 'تیر',
    5: 'مرداد',
    6: 'شهریور',
    7: 'مهر',
    8: 'آبان',
    9: 'آذر',
    10: 'دی',
    11: 'بهمن',
    12: 'اسفند',
  },
};

export function getFormattedDate(date: Date) {
  if (Platform.Version < 30 && SELECTED_SECONDARY_CALENDAR === 'persian') {
    // polyfill for older androids not showing persian calendar properly
    const month = new Intl.DateTimeFormat('en-US', {
      month: 'numeric',
      calendar: SELECTED_SECONDARY_CALENDAR,
    }).format(date);

    let dateParts = new Intl.DateTimeFormat(SELECTED_LOCALE, {
      day: '2-digit',
      year: 'numeric',
      calendar: SELECTED_SECONDARY_CALENDAR,
    })
      .format(date)
      .split(' ');

    let formattedDate;

    if (SELECTED_LOCALE.startsWith('fa')) {
      const monthName = persianMonthNames['fa'][month];
      formattedDate = `${dateParts[1]} ${monthName} ${dateParts[0]}`;
    } else {
      const monthName = persianMonthNames['en'][month];
      formattedDate = `${monthName} ${dateParts[0]}, ${dateParts[1]} AP`;
    }

    return formattedDate;
  } else {
    return new Intl.DateTimeFormat(SELECTED_LOCALE, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      calendar: SELECTED_SECONDARY_CALENDAR,
    }).format(date);
  }
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
      minute: '2-digit',
      dayPeriod: 'short',
    }).format(date);
  }
}

export function getArabicDate(date: Date) {
  let calendar;

  if (SELECTED_ARABIC_CALENDAR) {
    calendar = SELECTED_ARABIC_CALENDAR;
  } else {
    calendar = PREFERRED_LOCALE.startsWith('fa') ? 'islamic-civil' : 'islamic';
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

export type WeekDayName =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

export type WeekDayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const WeekDays: Record<WeekDayName, WeekDayIndex> &
  Record<WeekDayIndex, WeekDayName> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};
