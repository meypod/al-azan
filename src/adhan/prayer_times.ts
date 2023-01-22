import {
  PrayerTimes,
  Coordinates,
  SunnahTimes,
  CalculationParameters,
  HighLatitudeRule,
  Madhab,
  Shafaq,
  PolarCircleResolution,
} from 'adhan';
import {CalculationMethods} from './calculation_methods';
import {PrayersInOrder, Prayer} from './prayer';
import {
  CachedPrayerTimes,
  getCachedPrayerTimes,
} from '@/store/adhan_calc_cache';

import {
  alarmSettings,
  getAdhanSettingKey,
  PrayerAlarmSettings,
} from '@/store/alarm';
import {calcSettings, CalcSettingsStore} from '@/store/calculation';
import {addDays, getDayBeginning, WeekDayIndex} from '@/utils/date';

export type PrayerTimesOptions = {
  calculationParameters: CalculationParameters;
  coordinates: Coordinates;
};

export function isMinimumSettingsAvailable(calcState?: CalcSettingsStore) {
  if (!calcState) return false;

  const lat = calcState['LOCATION_LAT']!;
  const long = calcState['LOCATION_LONG']!;
  const calcMethodKey = calcState['CALCULATION_METHOD_KEY'];

  if (![lat, long, calcMethodKey].every(Boolean)) return false;

  if (isNaN(lat) || isNaN(long)) {
    return false;
  }

  return true;
}

function getPrayerTimesOptionsFromSettings() {
  const state = calcSettings.getState();
  if (!isMinimumSettingsAvailable(state)) return;

  const lat = state.LOCATION_LAT!;
  const long = state.LOCATION_LONG!;
  const calcMethodKey = state.CALCULATION_METHOD_KEY;
  const highLatRuleSetting = state.HIGH_LATITUDE_RULE;
  const asrCalcSetting = state.ASR_CALCULATION;
  const shafaqCalcSetting = state.SHAFAQ;
  const polarCicleResolutionSetting = state.POLAR_RESOLUTION;

  const prayerTimeOptions: PrayerTimesOptions = {
    calculationParameters: CalculationMethods[calcMethodKey!].get(),
    coordinates: new Coordinates(lat, long),
  };

  prayerTimeOptions.calculationParameters.adjustments = {
    asr: state.ASR_ADJUSTMENT,
    dhuhr: state.DHUHR_ADJUSTMENT,
    fajr: state.FAJR_ADJUSTMENT,
    isha: state.ISHA_ADJUSTMENT,
    maghrib: state.MAGHRIB_ADJUSTMENT,
    sunrise: state.SUNRISE_ADJUSTMENT,
  };

  switch (highLatRuleSetting) {
    case HighLatitudeRule.MiddleOfTheNight:
      prayerTimeOptions.calculationParameters.highLatitudeRule =
        HighLatitudeRule.MiddleOfTheNight;
      break;
    case HighLatitudeRule.SeventhOfTheNight:
      prayerTimeOptions.calculationParameters.highLatitudeRule =
        HighLatitudeRule.SeventhOfTheNight;
      break;
    case HighLatitudeRule.TwilightAngle:
      prayerTimeOptions.calculationParameters.highLatitudeRule =
        HighLatitudeRule.TwilightAngle;
      break;
    default:
      prayerTimeOptions.calculationParameters.highLatitudeRule =
        HighLatitudeRule.recommended(prayerTimeOptions.coordinates);
      break;
  }

  switch (asrCalcSetting) {
    case Madhab.Hanafi:
      prayerTimeOptions.calculationParameters.madhab = Madhab.Hanafi;
      break;
    case Madhab.Shafi:
    default:
      prayerTimeOptions.calculationParameters.madhab = Madhab.Shafi;
      break;
  }

  if (calcMethodKey === 'MoonsightingCommittee') {
    switch (shafaqCalcSetting) {
      case Shafaq.Abyad:
        prayerTimeOptions.calculationParameters.shafaq = Shafaq.Abyad;
        break;
      case Shafaq.Ahmer:
        prayerTimeOptions.calculationParameters.shafaq = Shafaq.Ahmer;
        break;
      default:
        prayerTimeOptions.calculationParameters.shafaq = Shafaq.General;
        break;
    }
  }

  switch (polarCicleResolutionSetting) {
    case PolarCircleResolution.AqrabBalad:
      prayerTimeOptions.calculationParameters.polarCircleResolution =
        PolarCircleResolution.AqrabBalad;
      break;
    case PolarCircleResolution.AqrabYaum:
      prayerTimeOptions.calculationParameters.polarCircleResolution =
        PolarCircleResolution.AqrabYaum;
      break;
    default:
      prayerTimeOptions.calculationParameters.polarCircleResolution =
        PolarCircleResolution.Unresolved;
      break;
  }
  return prayerTimeOptions;
}

export function calculatePrayerTimes(date: Date) {
  const options = getPrayerTimesOptionsFromSettings();
  if (!options) return;

  const prayerTimes: Partial<CachedPrayerTimes> = new PrayerTimes(
    options.coordinates,
    date,
    options.calculationParameters,
  );

  const sunnahTimes = new SunnahTimes(prayerTimes as any as PrayerTimes);
  prayerTimes.midnight = sunnahTimes.middleOfTheNight;
  prayerTimes.tahajjud = sunnahTimes.lastThirdOfTheNight;

  return prayerTimes as Required<CachedPrayerTimes>;
}

export type PrayerTime = {
  date: Date;
  prayer: Prayer;
  playSound?: boolean;
};

function shouldNotifyPrayer(prayer: Prayer, date: Date, useSettings?: boolean) {
  if (useSettings) {
    const notifySetting = alarmSettings.getState()[
      getAdhanSettingKey(prayer, 'notify')
    ] as PrayerAlarmSettings;
    if (
      typeof notifySetting === 'boolean' ||
      typeof notifySetting === 'undefined'
    ) {
      return !!notifySetting;
    } else if (notifySetting[date.getDay() as WeekDayIndex]) {
      return true;
    }
    return false;
  } else {
    return true;
  }
}

type NextPrayerOptions = {
  useSettings?: boolean;
  /** check only the next day for prayers */
  checkNextDay?: boolean;
  /** check the next 6 days, so a full week is checked */
  checkNextDays?: boolean;
  /** if set, next prayer of only given prayers is returned */
  prayers?: Array<Prayer>;
};

/** do not use this class directly. use getPrayerTimes instead */
export class PrayerTimesHelper {
  date: Date;

  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  sunset: Date;
  maghrib: Date;
  isha: Date;
  midnight: Date;
  tahajjud: Date;

  constructor(date: Date) {
    const cachedTimes = getCachedPrayerTimes(date);
    // we need the current date for calculating next prayer
    // thus not using the cachedTimes date
    this.date = date;
    this.fajr = cachedTimes.fajr;
    this.sunrise = cachedTimes.sunrise;
    this.dhuhr = cachedTimes.dhuhr;
    this.asr = cachedTimes.asr;
    this.sunset = cachedTimes.sunset;
    this.maghrib = cachedTimes.maghrib;
    this.isha = cachedTimes.isha;
    this.midnight = cachedTimes.midnight;
    this.tahajjud = cachedTimes.tahajjud;
  }

  nextPrayer(
    options: NextPrayerOptions = {
      useSettings: false,
      checkNextDay: false,
      checkNextDays: false,
    },
  ): PrayerTime | undefined {
    const {
      useSettings,
      checkNextDay,
      checkNextDays,
      prayers = PrayersInOrder,
    } = options || {};
    let prayerTime: PrayerTime | undefined;

    for (let prayer of prayers) {
      if (
        this.date <= this[prayer] &&
        shouldNotifyPrayer(prayer, this.date, useSettings)
      ) {
        prayerTime = {
          date: this[prayer],
          prayer,
        };
        break;
      }
    }

    if (prayerTime && useSettings) {
      const soundSetting = alarmSettings.getState()[
        getAdhanSettingKey(prayerTime.prayer, 'sound')
      ] as PrayerAlarmSettings;
      if (typeof soundSetting === 'boolean') {
        prayerTime.playSound = soundSetting;
      } else if (
        soundSetting &&
        soundSetting[this.date.getDay() as WeekDayIndex]
      ) {
        prayerTime.playSound = true;
      } else {
        prayerTime.playSound = false;
      }
    }

    if (!prayerTime && (checkNextDay || checkNextDays)) {
      // n+1 for limit (n starts from 1)
      let limit = 2;
      if (checkNextDays) {
        limit = 8;
      }
      for (let i = 1; i < limit; i++) {
        prayerTime = new PrayerTimesHelper(
          getDayBeginning(addDays(this.date, i)),
        ).nextPrayer({
          useSettings,
        });
        if (prayerTime) {
          break;
        }
      }
    }

    return prayerTime;
  }
}

export function getPrayerTimes(date: Date) {
  const options = getPrayerTimesOptionsFromSettings();
  if (!options) return;

  return new PrayerTimesHelper(date);
}
