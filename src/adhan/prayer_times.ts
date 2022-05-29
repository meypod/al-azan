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
import {
  ASR_CALCULATION,
  CALCULATION_METHOD_KEY,
  getAdhanSettingKey,
  HIGH_LATITUDE_RULE,
  LOCATION_LAT,
  LOCATION_LONG,
  POLAR_RESOLUTION,
  SHAFAQ,
} from '@/constants/settings';
import {getSettings, Settings} from '@/store/settings';

export class PrayerTimesExtended extends PrayerTimes {
  motn!: Date;

  // @ts-ignore
  nextPrayer(settings?: Settings) {
    let prayerTime: PrayerTime | undefined;

    for (let prayer of PrayersInOrder) {
      if (this.date <= this[prayer] && shouldNotifyPrayer(prayer, settings)) {
        prayerTime = {
          date: this[prayer],
          prayer,
        };
        break;
      }
    }

    if (prayerTime && settings) {
      prayerTime.playSound = settings.get<boolean>(
        getAdhanSettingKey(prayerTime.prayer, 'sound'),
      );
    }

    return prayerTime;
  }
}

export type PrayerTimesOptions = {
  calculationParameters: CalculationParameters;
  coordinates: Coordinates;
};

async function getPrayerTimesOptionsFromSettings() {
  const settings = await getSettings();
  if (!settings) {
    return;
  }
  const lat = settings.get<number>(LOCATION_LAT);
  const long = settings.get<number>(LOCATION_LONG);
  const calcMethodKey = settings.get<string>(CALCULATION_METHOD_KEY);
  const highLatRuleSetting = settings.get<string>(HIGH_LATITUDE_RULE);
  const asrCalcSetting = settings.get<string>(ASR_CALCULATION);
  const shafaqCalcSetting = settings.get<string>(SHAFAQ);
  const polarCicleResolutionSetting = settings.get<string>(POLAR_RESOLUTION);

  if (![lat, long, calcMethodKey].every(Boolean)) return;

  if (isNaN(lat) || isNaN(long)) {
    return;
  }

  const prayerTimeOptions: PrayerTimesOptions = {
    calculationParameters: CalculationMethods[calcMethodKey].get(),
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

export async function getPrayerTimes(date: Date) {
  const options = await getPrayerTimesOptionsFromSettings();
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

function shouldNotifyPrayer(prayer: Prayer, settings?: Settings) {
  if (settings === undefined) {
    return true;
  } else {
    return settings.get<boolean>(getAdhanSettingKey(prayer, 'notify'));
  }
}
