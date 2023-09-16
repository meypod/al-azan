import {t} from '@lingui/macro';
import {CalculationMethod, CalculationParameters} from 'adhan-extended';

export type CalculationMethodEntry = {
  label: string;
  info: string;
  get: () => CalculationParameters;
  /** this is used by some other code internally */
  key?: string;
};

export const CalculationMethods: Record<string, CalculationMethodEntry> = {
  Custom: {
    label: t`Custom`,
    info: 'Sets a Fajr angle of 0 and an Isha angle of 0.' as const,
    get: CalculationMethod.Other,
  },

  MoonsightingCommittee: {
    label: t`Moonsighting Committee`,
    info: 'Uses a Fajr angle of 18 and an Isha angle of 18. Also uses seasonal adjustment values.' as const,
    get: CalculationMethod.MoonsightingCommittee,
  },

  MuslimWorldLeague: {
    label: t`Muslim World League`,
    info: 'Uses Fajr angle of 18 and an Isha angle of 17' as const,
    get: CalculationMethod.MuslimWorldLeague,
  },

  Egyptian: {
    label: t`Egyptian General Survey Authority`,
    info: 'Uses Fajr angle of 19.5 and an Isha angle of 17.5' as const,
    get: CalculationMethod.Egyptian,
  },

  Karachi: {
    label: t`University of Islamic Sciences, Karachi` + ', ' + t`Pakistan`,
    info: 'Uses Fajr angle of 18 and an Isha angle of 18' as const,
    get: CalculationMethod.Karachi,
  },

  UmmAlQura: {
    label: t`Umm al-Qura University, Makkah` + ', ' + t`Saudi Arabia`,
    info: 'Uses a Fajr angle of 18.5 and an Isha interval of 90 minutes.\nNote: You should add a +30 minute custom adjustment of Isha during Ramadan.' as const,
    get: CalculationMethod.UmmAlQura,
  },

  NorthAmerica: {
    label: t`Islamic Society of North America (ISNA)`,
    info: 'This method is included for completeness, but is not recommended.\nUses a Fajr angle of 15 and an Isha angle of 15.' as const,
    get: CalculationMethod.NorthAmerica,
  },

  Gulf: {
    label: t`Gulf region`,
    info: 'Modified version of Umm al-Qura that uses a Fajr angle of 19.5.',
    get: () => new CalculationParameters('Other', 19.5, undefined, 90),
  },

  Dubai: {
    label: t`The Gulf Region (Dubai)`,
    info: 'Uses Fajr and Isha angles of 18.2 degrees.',
    get: CalculationMethod.Dubai,
  },

  Kuwait: {
    label: t`Kuwait`,
    info: 'Uses a Fajr angle of 18 and an Isha angle of 17.5',
    get: CalculationMethod.Kuwait,
  },

  Qatar: {
    label: t`Qatar`,
    info: 'Modified version of Umm al-Qura that uses a Fajr angle of 18.',
    get: CalculationMethod.Qatar,
  },

  Singapore: {
    label: t`Singapore`,
    info: 'Uses a Fajr angle of 20 and an Isha angle of 18' as const,
    get: CalculationMethod.Singapore,
  },

  France: {
    label: t`Union Organization Islamic de France`,
    info: 'Uses a Fajr angle of 12 and an Isha angle of 12.',
    get: () => new CalculationParameters('Other', 12.0, 12.0),
  },

  France15: {
    label: t`France angle 15`,
    info: 'Uses a Fajr angle of 15 and an Isha angle of 15.',
    get: () => new CalculationParameters('Other', 15.0, 15.0),
  },

  France18: {
    label: t`France angle 18`,
    info: 'Uses a Fajr angle of 18 and an Isha angle of 18.',
    get: () => new CalculationParameters('Other', 18.0, 18.0),
  },

  Turkey: {
    label: t`Diyanet İşleri Başkanlığı, Turkey`,
    info: 'Uses a Fajr angle of 18 and an Isha angle of 17.',
    get: CalculationMethod.Turkey,
  },

  Russia: {
    label: t`Spiritual Administration of Muslims of Russia`,
    info: 'Uses a Fajr angle of 16 and an Isha angle of 15.',
    get: () => new CalculationParameters('Other', 16.0, 15.0),
  },

  Jafari: {
    label: t`Shia Ithna Ashari, Leva Institute, Qum` + ', ' + t`Iran`,
    info: 'Uses Fajr angle of 16, Maghrib angle of 4 and Isha angle of 14',
    get: () => new CalculationParameters('Other', 16.0, 14.0, 0, 4.0),
  },

  Tehran: {
    label:
      t`Shia, Institute of Geophysics, University of Tehran` + ', ' + t`Iran`,
    info: 'Uses Fajr angle of 17.7, Maghrib angle of 4.5 and Isha angle of 14',
    get: CalculationMethod.Tehran,
  },

  Kemenag: {
    label: t`Kementrian Agama Republik Indonesia (KEMENAG)`,
    info: 'Uses Fajr angle of 20.0 and Isha angle of 18',
    get: () => new CalculationParameters('Other', 20.0, 18.0),
  },

  Algeria: {
    label: t`Ministry of Religious Affairs and Wakfs, Algeria`,
    info: 'Uses Fajr angle of 18, Isha angle of 17, + 3min maghrib',
    get: () => {
      const params = new CalculationParameters('Other', 18.0, 17.0);
      params.methodAdjustments = {
        ...params.methodAdjustments,
        sunset: 3,
        maghrib: 3,
      };
      return params;
    },
  },

  Brunei: {
    label: t`Kementrian Hal Ehwal Ugama (Brunei Darussalam)`,
    info: 'Uses Fajr angle of 20 and Isha angle of 18',
    get: () => new CalculationParameters('Other', 20.0, 18.0),
  },

  Tunisia: {
    label: t`Ministry of Religious Affairs of Tunisia`,
    info: 'Uses Fajr angle of 18 and Isha angle of 18',
    get: () => new CalculationParameters('Other', 18.0, 18.0),
  },
};
