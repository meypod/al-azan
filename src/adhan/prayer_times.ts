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
import intersection from 'lodash/intersection';
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
import {isRamadan} from '@/utils/ramadan';

export type PrayerTimesOptions = {
  calculationParameters: CalculationParameters;
  coordinates: Coordinates;
  calcMethodKey: string;
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
    calcMethodKey: calcMethodKey!,
  };

  prayerTimeOptions.calculationParameters.adjustments = {
    fajr: state.FAJR_ADJUSTMENT,
    sunrise: state.SUNRISE_ADJUSTMENT,
    dhuhr: state.DHUHR_ADJUSTMENT,
    asr: state.ASR_ADJUSTMENT,
    sunset: state.SUNSET_ADJUSTMENT,
    maghrib: state.MAGHRIB_ADJUSTMENT,
    isha: state.ISHA_ADJUSTMENT,
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

  if (options.calcMethodKey === 'UmmAlQura' && isRamadan(date)) {
    options.calculationParameters.ishaInterval = 120;
  }

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
  /** when is this prayer time */
  date: Date;
  /** The date this prayer time is calculated from */
  calculatedFrom: Date;
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
  /** the date to get the next prayer for */
  date?: Date;

  /** an internal option for recursing */
  _originalDate?: Date | boolean;
  /** should we consider the user settings?
   * setting this to true means that we only return a prayer if
   *  user has enabled notification/sound for the prayer, otherwise `undefined` is returned */
  useSettings?: boolean;
  /** check only the next day for prayers */
  checkNextDay?: boolean;
  /** check the next 6 days, so a full week is checked */
  checkNextDays?: boolean;
  /** if set, next prayer of only given prayers is returned */
  prayers?: Array<Prayer>;
};

export function getPrayerTimes(date: Date) {
  const options = getPrayerTimesOptionsFromSettings();
  if (!options) return;

  return getCachedPrayerTimes(date);
}

export function getNextPrayer(
  options?: NextPrayerOptions,
): PrayerTime | undefined {
  const {
    date = new Date(),
    _originalDate = undefined,
    useSettings = false,
    checkNextDay = false,
    checkNextDays = false,
    prayers = PrayersInOrder,
  } = options || {};

  if (!prayers.length) return;

  const originalDate = _originalDate || date;

  const prayerTimes = getPrayerTimes(date);

  if (!prayerTimes) return;

  let prayerTime: PrayerTime | undefined;

  // we need this check only for the first 6 hours of the day
  if (date.getHours() < 6 && typeof _originalDate === 'undefined') {
    const prayerTimeFromPrevDay = getNextPrayer({
      date: addDays(date, -1),
      useSettings,
      _originalDate: date,
      prayers: intersection([Prayer.Midnight, Prayer.Tahajjud], prayers), // we only need to check prayers that can go after 00:00 AM
    });
    if (prayerTimeFromPrevDay) return prayerTimeFromPrevDay; // otherwise continue getting it normally
  }

  for (let prayer of prayers) {
    if (
      originalDate <= prayerTimes[prayer] &&
      shouldNotifyPrayer(prayer, date, useSettings)
    ) {
      prayerTime = {
        date: prayerTimes[prayer],
        calculatedFrom: date,
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
    } else if (soundSetting && soundSetting[date.getDay() as WeekDayIndex]) {
      prayerTime.playSound = true;
    } else {
      prayerTime.playSound = false;
    }
  }

  if (!prayerTime && !_originalDate && (checkNextDay || checkNextDays)) {
    // n+1 for limit (n starts from 1)
    let limit = 2;
    if (checkNextDays) {
      limit = 8;
    }
    for (let i = 1; i < limit; i++) {
      const dayToCheck = getDayBeginning(addDays(date, i));
      prayerTime = getNextPrayer({
        useSettings,
        date: dayToCheck,
        _originalDate: false, // this makes it a boolean, and thus not checking the day before it
      });
      if (prayerTime) {
        break;
      }
    }
  }

  return prayerTime;
}
