import {MessageDescriptor} from '@lingui/core';
import {defineMessage} from '@lingui/macro';

export enum Prayer {
  Fajr = 'fajr',
  Sunrise = 'sunrise',
  Dhuhr = 'dhuhr',
  Asr = 'asr',
  Sunset = 'sunset',
  Maghrib = 'maghrib',
  Isha = 'isha',
  /** middle of the night */
  Motn = 'motn',
}

export const NonPrayer = [Prayer.Sunrise, Prayer.Sunset, Prayer.Motn];

export const PrayersInOrder = [
  Prayer.Fajr,
  Prayer.Sunrise,
  Prayer.Dhuhr,
  Prayer.Asr,
  Prayer.Sunset,
  Prayer.Maghrib,
  Prayer.Isha,
  /** middle of the night */
  Prayer.Motn,
];

export const prayerTranslations = {
  fajr: defineMessage({
    id: 'fajr.prayer',
    message: 'Fajr',
  }),
  sunrise: defineMessage({
    id: 'sunrise',
    message: 'Sunrise',
  }),
  dhuhr: defineMessage({
    id: 'dhuhr.prayer',
    message: 'Dhuhr',
  }),
  asr: defineMessage({
    id: 'asr.prayer',
    message: 'Asr',
  }),
  sunset: defineMessage({
    id: 'sunset',
    message: 'Sunset',
  }),
  maghrib: defineMessage({
    id: 'maghrib.prayer',
    message: 'Maghrib',
  }),
  isha: defineMessage({
    id: 'isha.prayer',
    message: 'Isha',
  }),
  motn: defineMessage({
    id: 'sunnah.motn',
    message: 'Middle Of The Night',
  }),
} as Record<string, MessageDescriptor>;
