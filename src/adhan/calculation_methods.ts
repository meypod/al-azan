import {t} from '@lingui/macro';
import {CalculationMethod, CalculationParameters} from 'adhan';

type CalculationMethodEntry = {
  label: string;
  info: string;
  get: () => CalculationParameters;
};

export const CalculationMethods: Record<string, CalculationMethodEntry> = {
  /**
   * The default value for {@link CalculationParameters#method} when initializing a
   * {@link CalculationParameters} object. Sets a Fajr angle of 0 and an Isha angle of 0.
   */
  // Other: {
  //   label: t`Other`,
  //   info: 'Sets a Fajr angle of 0 and an Isha angle of 0.' as const,
  //   get: CalculationMethod.Other,
  // },

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
    label: t`University of Islamic Sciences, Karachi`,
    info: 'Uses Fajr angle of 18 and an Isha angle of 18' as const,
    get: CalculationMethod.Karachi,
  },

  UmmAlQura: {
    label: t`Umm al-Qura University, Makkah`,
    info: 'Uses a Fajr angle of 18.5 and an Isha interval of 90 minutes.\nNote: You should add a +30 minute custom adjustment of Isha during Ramadan.' as const,
    get: CalculationMethod.UmmAlQura,
  },

  NorthAmerica: {
    label: t`Referred to as the ISNA method`,
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
    label: t`Shia Ithna Ashari, Leva Institute, Qum`,
    info: 'Uses Fajr angle of 16, Maghrib angle of 4 and Isha angle of 14',
    get: () => new CalculationParameters('Other', 16.0, 14.0, 0, 4.0),
  },

  Tehran: {
    label: t`Shia, Institute of Geophysics, University of Tehran`,
    info: 'Uses Fajr angle of 17.7, Maghrib angle of 4.5 and Isha angle of 14',
    get: CalculationMethod.Tehran,
  },

  Kemenag: {
    label: t`Kementrian Agama Republik Indonesia (KEMENAG)`,
    info: 'Uses Fajr angle of 20.0 and Isha angle of 18',
    get: () => new CalculationParameters('Other', 20.0, 18.0),
  },
};
