import {Prayer} from '@/adhan';

export const ADHAN_NOTIFICATION_SUFFIX = '_notify';
export const ADHAN_SOUND_SUFFIX = '_sound';
export const SAVED_ADHAN_AUDIO_ENTRIES = 'saved_adhan_audio_entries';
export const SELECTED_ADHAN_ENTRY = 'selected_adhan_entry';
export const LOCATION_LAT = 'location_lat';
export const LOCATION_LONG = 'location_long';
export const LOCATION_COUNTRY = 'location_country';
export const LOCATION_CITY = 'location_city';
export const CALCULATION_METHOD_KEY = 'calc_method';
export const HIGH_LATITUDE_RULE = 'calc_high_latitude_rule';
export const ASR_CALCULATION = 'calc_asr_calculation';
export const SHAFAQ = 'calc_shafaq';
export const POLAR_RESOLUTION = 'calc_polar_resolution';
export const APP_INTRO_DONE = 'app_intro_done';
export const APP_INITIAL_CONFIG_DONE = 'app_initial_config_done';
export const SELECTED_LANGUAGE = 'selected_language';

export function getAdhanSettingKey(
  prayer: Prayer,
  k: 'sound' | 'notify',
): string {
  if (k === 'notify') {
    return prayer + ADHAN_NOTIFICATION_SUFFIX;
  } else {
    return prayer + ADHAN_SOUND_SUFFIX;
  }
}
