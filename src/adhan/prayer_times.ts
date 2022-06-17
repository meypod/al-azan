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
import {Prayer, PrayersInOrder} from './prayer';
import {getAdhanSettingKey, settings} from '@/store/settings';

export class PrayerTimesExtended extends PrayerTimes {
  motn!: Date;

  // @ts-ignore
  nextPrayer(useSettings?: boolean) {
    let prayerTime: PrayerTime | undefined;

    for (let prayer of PrayersInOrder) {
      if (
        this.date <= this[prayer] &&
        shouldNotifyPrayer(prayer, useSettings)
      ) {
        prayerTime = {
          date: this[prayer],
          prayer,
        };
        break;
      }
    }

    if (prayerTime && useSettings) {
      prayerTime.playSound = settings.getState()[
        getAdhanSettingKey(prayerTime.prayer, 'sound')
      ] as boolean;
    }

    return prayerTime;
  }
}

export type PrayerTimesOptions = {
  calculationParameters: CalculationParameters;
  coordinates: Coordinates;
};

export function isMinimumSettingsAvailable() {
  const state = settings.getState();
  const lat = state['LOCATION_LAT']!;
  const long = state['LOCATION_LONG']!;
  const calcMethodKey = state['CALCULATION_METHOD_KEY'];

  if (![lat, long, calcMethodKey].every(Boolean)) return false;

  if (isNaN(lat) || isNaN(long)) {
    return false;
  }

  return true;
}

function getPrayerTimesOptionsFromSettings() {
  if (!isMinimumSettingsAvailable()) return;
  const state = settings.getState();

  const lat = state['LOCATION_LAT']!;
  const long = state['LOCATION_LONG']!;
  const calcMethodKey = state['CALCULATION_METHOD_KEY'];
  const highLatRuleSetting = state['HIGH_LATITUDE_RULE'];
  const asrCalcSetting = state['ASR_CALCULATION'];
  const shafaqCalcSetting = state['SHAFAQ'];
  const polarCicleResolutionSetting = state['POLAR_RESOLUTION'];

  const prayerTimeOptions: PrayerTimesOptions = {
    calculationParameters: CalculationMethods[calcMethodKey!].get(),
    coordinates: new Coordinates(lat, long),
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

export function getPrayerTimes(date: Date) {
  const options = getPrayerTimesOptionsFromSettings();
  if (!options) return;

  const prayerTimes = new PrayerTimesExtended(
    options.coordinates,
    date,
    options.calculationParameters,
  );

  const middleOfTheNightTime = new SunnahTimes(
    prayerTimes as any as PrayerTimes,
  ).middleOfTheNight;
  prayerTimes.motn = middleOfTheNightTime;

  return prayerTimes;
}

type PrayerTime = {
  date: Date;
  prayer: Prayer;
  playSound?: boolean;
};

function shouldNotifyPrayer(prayer: Prayer, useSettings?: boolean) {
  if (useSettings) {
    return settings.getState()[getAdhanSettingKey(prayer, 'notify')];
  } else {
    return true;
  }
}
