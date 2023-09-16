import {MessageDescriptor, i18n} from '@lingui/core';
import {defineMessage, t} from '@lingui/macro';
import {Platform} from 'react-native';
import {CalcSettingsStore, calcSettings} from '@/store/calculation';
import {SettingsStore, settings} from '@/store/settings';

const timeTranslations = {
  day: defineMessage({
    id: 'date.day',
    message: 'day',
  }),
  hour: defineMessage({
    id: 'date.hour',
    message: 'hour',
  }),
  minute: defineMessage({
    id: 'date.minute',
    message: 'minute',
  }),
  second: defineMessage({
    id: 'date.second',
    message: 'second',
  }),
} as Record<string, MessageDescriptor>;

/** adding numbering to a locale that already has a numbering system is a noop */
function addNumberingToLocale(
  SELECTED_LOCALE: string,
  NUMBERING_SYSTEM: string,
) {
  if (!NUMBERING_SYSTEM) return SELECTED_LOCALE;
  if (SELECTED_LOCALE.includes('-nu-')) return SELECTED_LOCALE;
  if (SELECTED_LOCALE.includes('-u-')) {
    return `${SELECTED_LOCALE}-nu-${NUMBERING_SYSTEM}`;
  } else {
    return `${SELECTED_LOCALE}-u-nu-${NUMBERING_SYSTEM}`;
  }
}

function addCalendarToLocale(SELECTED_LOCALE: string, CALENDAR?: string) {
  if (!CALENDAR) return SELECTED_LOCALE;
  if (SELECTED_LOCALE.includes('-u-')) {
    return `${SELECTED_LOCALE}-ca-${CALENDAR}`;
  } else {
    return `${SELECTED_LOCALE}-u-ca-${CALENDAR}`;
  }
}

let IS_24_HOUR_FORMAT: SettingsStore['IS_24_HOUR_FORMAT'],
  NUMBERING_SYSTEM: SettingsStore['NUMBERING_SYSTEM'],
  SELECTED_LOCALE: SettingsStore['SELECTED_LOCALE'],
  SELECTED_ARABIC_CALENDAR: SettingsStore['SELECTED_ARABIC_CALENDAR'],
  SELECTED_LOCALE_FOR_ARABIC_CALENDAR: SettingsStore['SELECTED_LOCALE_FOR_ARABIC_CALENDAR'],
  SELECTED_SECONDARY_CALENDAR: SettingsStore['SELECTED_SECONDARY_CALENDAR'];
let HIJRI_DATE_ADJUSTMENT: CalcSettingsStore['HIJRI_DATE_ADJUSTMENT'];

export let formatNu: Intl.NumberFormat['format'] = new Intl.NumberFormat(
  'en-US',
).format;

function updateState({
  settingsState,
  calcSettingsState,
}: {
  settingsState?: SettingsStore;
  calcSettingsState?: CalcSettingsStore;
} = {}) {
  if (settingsState) {
    IS_24_HOUR_FORMAT = settingsState.IS_24_HOUR_FORMAT;
    NUMBERING_SYSTEM = settingsState.NUMBERING_SYSTEM;
    SELECTED_LOCALE = addNumberingToLocale(
      settingsState.SELECTED_LOCALE,
      NUMBERING_SYSTEM,
    );
    formatNu = new Intl.NumberFormat(SELECTED_LOCALE).format;

    SELECTED_ARABIC_CALENDAR = settingsState.SELECTED_ARABIC_CALENDAR;
    if (!SELECTED_ARABIC_CALENDAR) {
      SELECTED_ARABIC_CALENDAR = SELECTED_LOCALE.startsWith('fa')
        ? 'islamic-civil'
        : 'islamic';
    }

    if (settingsState.SELECTED_LOCALE_FOR_ARABIC_CALENDAR) {
      SELECTED_LOCALE_FOR_ARABIC_CALENDAR = addNumberingToLocale(
        settingsState.SELECTED_LOCALE_FOR_ARABIC_CALENDAR,
        NUMBERING_SYSTEM,
      );
    }

    SELECTED_LOCALE_FOR_ARABIC_CALENDAR = addCalendarToLocale(
      settingsState.SELECTED_LOCALE_FOR_ARABIC_CALENDAR || SELECTED_LOCALE,
      SELECTED_ARABIC_CALENDAR,
    );
    SELECTED_SECONDARY_CALENDAR =
      settingsState.SELECTED_SECONDARY_CALENDAR || 'gregory';
  }

  if (calcSettingsState) {
    HIJRI_DATE_ADJUSTMENT = calcSettingsState.HIJRI_DATE_ADJUSTMENT;
  }
}

updateState({
  settingsState: settings.getState(),
  calcSettingsState: calcSettings.getState(),
});
settings.subscribe(settingsState => {
  updateState({
    settingsState,
  });
});
calcSettings.subscribe(calcSettingsState => {
  updateState({
    calcSettingsState,
  });
});

const oneMinuteInMs = 60 * 1000;
const oneHourInMs = oneMinuteInMs * 60;
const oneDayInMs = 24 * oneHourInMs;

export function addDays(date: Date, days: number) {
  if (!days) return new Date(date.getTime());
  let result = new Date(date.getTime());
  result.setDate(date.getDate() + days);
  while (result.toDateString() === date.toDateString()) {
    // this is for tricky daylight savings
    result = new Date(result.valueOf() + (days / Math.abs(days)) * oneHourInMs);
  }
  return result;
}

export function addMonths(date: Date, months: number, hijri?: boolean) {
  let result = new Date(date.getTime());
  if (!months) return result;
  result.setDate(date.getDate() + months * 28);
  while (getMonthName(result, hijri) === getMonthName(date, hijri)) {
    // this is for tricky daylight savings
    result = new Date(
      result.valueOf() + (months / Math.abs(months)) * oneDayInMs,
    );
  }
  return result;
}

export function getDayBeginning(date: Date) {
  const beginningOfDay = new Date(date.valueOf());
  let hours = 0;
  beginningOfDay.setHours(hours, 0, 0, 0);
  while (beginningOfDay.toDateString() !== date.toDateString()) {
    if (date.getDate() > beginningOfDay.getDate()) {
      hours += 1;
    } else {
      hours -= 1;
    }
    beginningOfDay.setHours(hours, 0, 0, 0);
  }

  return beginningOfDay;
}

export function getNextDayBeginning(date: Date) {
  return getDayBeginning(addDays(date, 1));
}

export function getPrevDayBeginning(date: Date) {
  return getDayBeginning(addDays(date, -1));
}

function toEnglishDigits(s: string) {
  return s.replace(/[\u0660-\u0669\u06F0-\u06F9]/g, function (a): string {
    return (a.charCodeAt(0) & 0xf) as any;
  });
}

export function getMonthDates(date: Date, hijri?: boolean) {
  const dates = [];

  if (hijri) {
    // Hijri date is tricky
    // have to get current representation of adjusted date, count days back to month's start,
    // then count up to month's end
    // while counting add the day to the original date as new date
    // push the calculated dates

    const hijriDayNumFormatter = Intl.DateTimeFormat(
      `en-US-u-ca-${SELECTED_ARABIC_CALENDAR}`,
      {
        day: 'numeric',
      },
    );

    // toEnglishDigits is to be able to parse the number
    // older androids don't respect the -nu-latn parameter even if added.

    const adjustedHijriDate = addDays(date, HIJRI_DATE_ADJUSTMENT);
    // coutdown to 1
    for (
      let dateInHijriMonth = parseInt(
          toEnglishDigits(hijriDayNumFormatter.format(adjustedHijriDate)),
          10,
        ),
        j = 0;
      dateInHijriMonth > 0;
      dateInHijriMonth--, j++
    ) {
      dates.push(addDays(date, -j));
    }

    dates.reverse(); // so for example that dates are 1, 2, 3 instead of 3, 2, 1

    // coutdown to end of the month, which can vary between 29,30 ? or maybe some other weird numbers.
    // start from current date representation in hijri and increase it until
    // the month changes
    for (
      let i = addDays(date, 1), j = 1;
      getYearAndMonth(date, true) === getYearAndMonth(i, true);
      j++, i = addDays(i, 1)
    ) {
      dates.push(i);
    }
    return dates;
  }

  // for secondary calendar, which does not do representation adjustment:

  let beginningOfMonth = new Date(date.valueOf());

  const day = Intl.DateTimeFormat(`en-US-u-ca-${SELECTED_SECONDARY_CALENDAR}`, {
    day: 'numeric',
  }).format(date);
  const subtractAmount = parseInt(day, 10) - 1;
  beginningOfMonth.setDate(beginningOfMonth.getDate() - subtractAmount);
  while (getMonthName(beginningOfMonth, hijri) !== getMonthName(date, hijri)) {
    beginningOfMonth = new Date(beginningOfMonth.getTime() + 60 * 60 * 1000);
  }
  const ymOfOgDate = getYearAndMonth(date, hijri);
  // get first day in month:
  let counterDate = new Date(beginningOfMonth);
  // iter
  for (
    ;
    getYearAndMonth(counterDate, hijri) === ymOfOgDate;
    counterDate = addDays(counterDate, 1)
  ) {
    dates.push(counterDate);
  }
  return dates;
}

export function getDayName(date: Date, length: 'long' | 'short' = 'long') {
  return Intl.DateTimeFormat(SELECTED_LOCALE, {
    weekday: length,
  }).format(date);
}

export function getDayNumeric(date: Date, hijri?: boolean) {
  if (hijri) {
    return getHijriDay(date);
  }
  return Intl.DateTimeFormat(SELECTED_LOCALE, {
    day: 'numeric',
    calendar: SELECTED_SECONDARY_CALENDAR,
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

export function getFormattedDate(date: Date, weekday?: boolean) {
  if (
    Platform.OS === 'android' &&
    Platform.Version < 30 &&
    SELECTED_SECONDARY_CALENDAR === 'persian'
  ) {
    // polyfill for older androids not showing persian calendar properly
    const month = Intl.DateTimeFormat('en-US', {
      month: 'numeric',
      calendar: SELECTED_SECONDARY_CALENDAR,
    }).format(date);

    let dateParts = Intl.DateTimeFormat(SELECTED_LOCALE, {
      day: '2-digit',
      year: 'numeric',
      calendar: SELECTED_SECONDARY_CALENDAR,
    })
      .format(date)
      .split(' ');

    let dayName = '';
    if (weekday) {
      dayName =
        Intl.DateTimeFormat(SELECTED_LOCALE, {
          calendar: SELECTED_SECONDARY_CALENDAR,
          weekday: weekday ? 'long' : undefined,
        }).format(date) + ' ';
    }

    let formattedDate;

    if (SELECTED_LOCALE.startsWith('fa')) {
      const monthName = persianMonthNames['fa'][month];
      formattedDate = `${dayName}${dateParts[1]} ${monthName} ${dateParts[0]}`;
    } else {
      const monthName = persianMonthNames['en'][month];
      formattedDate = `${dayName}${monthName} ${dateParts[0]}, ${dateParts[1]} AP`;
    }

    return formattedDate;
  } else {
    return Intl.DateTimeFormat(SELECTED_LOCALE, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      calendar: SELECTED_SECONDARY_CALENDAR,
      weekday: weekday ? 'long' : undefined,
    }).format(date);
  }
}

export function getMonthName(date: Date, hijri?: boolean) {
  if (hijri) return getArabicMonthName(date);
  if (
    Platform.OS === 'android' &&
    Platform.Version < 30 &&
    SELECTED_SECONDARY_CALENDAR === 'persian'
  ) {
    // polyfill for older androids not showing persian calendar properly
    const month = Intl.DateTimeFormat('en-US', {
      month: 'numeric',
      calendar: SELECTED_SECONDARY_CALENDAR,
    }).format(date);

    if (SELECTED_LOCALE.startsWith('fa')) {
      return persianMonthNames['fa'][month];
    } else {
      return persianMonthNames['en'][month];
    }
  } else {
    return Intl.DateTimeFormat(SELECTED_LOCALE, {
      month: 'long',
      calendar: SELECTED_SECONDARY_CALENDAR,
    }).format(date);
  }
}

export function getYearAndMonth(date: Date, hijri?: boolean) {
  if (hijri) {
    const adjustedDate = addDays(date, HIJRI_DATE_ADJUSTMENT);

    return Intl.DateTimeFormat(SELECTED_LOCALE_FOR_ARABIC_CALENDAR, {
      year: 'numeric',
      month: 'long',
    }).format(adjustedDate);
  }

  if (
    Platform.OS === 'android' &&
    Platform.Version < 30 &&
    SELECTED_SECONDARY_CALENDAR === 'persian'
  ) {
    // polyfill for older androids not showing persian calendar properly
    const month = Intl.DateTimeFormat('en-US', {
      month: 'numeric',
      calendar: SELECTED_SECONDARY_CALENDAR,
    }).format(date);

    const year = Intl.DateTimeFormat(SELECTED_LOCALE, {
      year: 'numeric',
      calendar: SELECTED_SECONDARY_CALENDAR,
    }).format(date);

    let formattedDate;

    if (SELECTED_LOCALE.startsWith('fa')) {
      const monthName = persianMonthNames['fa'][month];
      formattedDate = `${monthName} ${year}`;
    } else {
      const monthName = persianMonthNames['en'][month];
      formattedDate = `${monthName}, ${year} AP`;
    }

    return formattedDate;
  } else {
    return Intl.DateTimeFormat(SELECTED_LOCALE, {
      month: 'long',
      year: 'numeric',
      calendar: SELECTED_SECONDARY_CALENDAR,
    }).format(date);
  }
}

const faDayPeriodRegex = /([قب]).+از.?ظهر/;

export function getTime(date: Date) {
  if (IS_24_HOUR_FORMAT) {
    return Intl.DateTimeFormat(SELECTED_LOCALE, {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } else {
    return Intl.DateTimeFormat(SELECTED_LOCALE, {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      dayPeriod: 'short',
    })
      .format(date)
      .replace(faDayPeriodRegex, '$1.ظ');
  }
}

export function getArabicMonthName(date: Date) {
  const adjustedDate = addDays(date, HIJRI_DATE_ADJUSTMENT);
  return Intl.DateTimeFormat(SELECTED_LOCALE_FOR_ARABIC_CALENDAR, {
    month: 'long',
  }).format(adjustedDate);
}

export function getArabicDate(date: Date) {
  const adjustedDate = addDays(date, HIJRI_DATE_ADJUSTMENT);

  return Intl.DateTimeFormat(SELECTED_LOCALE_FOR_ARABIC_CALENDAR, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(adjustedDate);
}

export function getHijriYear(date: Date) {
  const adjustedDate = addDays(date, HIJRI_DATE_ADJUSTMENT);

  return Intl.DateTimeFormat(SELECTED_LOCALE_FOR_ARABIC_CALENDAR, {
    year: 'numeric',
  }).format(adjustedDate);
}

export function getHijriMonth(date: Date) {
  const adjustedDate = addDays(date, HIJRI_DATE_ADJUSTMENT);

  return Intl.DateTimeFormat(SELECTED_LOCALE_FOR_ARABIC_CALENDAR, {
    month: 'numeric',
  }).format(adjustedDate);
}

export function getHijriDay(date: Date) {
  const adjustedDate = addDays(date, HIJRI_DATE_ADJUSTMENT);

  return Intl.DateTimeFormat(
    addNumberingToLocale(SELECTED_LOCALE_FOR_ARABIC_CALENDAR, NUMBERING_SYSTEM),
    {
      day: 'numeric',
    },
  ).format(adjustedDate);
}

export type DateDiff = {
  days: number;
  hours: number;
  minutes: number;
  future: boolean;
};

export function getDateDiff(from: Date | number, to: Date | number): DateDiff {
  const diff = from.valueOf() - to.valueOf();
  const dayDiffMod = diff % oneDayInMs;
  const dayDiff = (diff - dayDiffMod) / oneDayInMs;
  const hourDiffMod = dayDiffMod % oneHourInMs;
  const hourDiff = Math.floor((dayDiffMod - hourDiffMod) / oneHourInMs);
  const minDiffMod = hourDiffMod % 1000;
  const minDiff = Math.floor((hourDiffMod - minDiffMod) / oneMinuteInMs);
  return {
    days: Math.abs(dayDiff),
    hours: Math.abs(hourDiff),
    minutes: Math.abs(minDiff),
    future: diff.valueOf() < 0,
  };
}

export function getFormattedDateDiff(diff: DateDiff) {
  if (!(diff.days || diff.hours || diff.minutes)) return t`Just now`;
  const d = i18n._(timeTranslations['day']).charAt(0);
  const h = i18n._(timeTranslations['hour']).charAt(0);
  const m = i18n._(timeTranslations['minute']).charAt(0);

  const tense = diff.future ? t`later` : t`ago`;

  if (!diff.hours && !diff.days) {
    return `${formatNu(diff.minutes)}${m} ${tense}`;
  } else if (!diff.days) {
    return `${formatNu(diff.hours)}${h} ${formatNu(diff.minutes)}${m} ${tense}`;
  } else {
    return `${formatNu(diff.days)}${d} ${formatNu(diff.hours)}${h} ${tense}`;
  }
}

export function isDateToday(date: Date, hijri?: boolean) {
  if (hijri) {
    return getArabicDate(date) === getArabicDate(new Date());
  } else {
    return date.toDateString() === new Date().toDateString();
  }
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
