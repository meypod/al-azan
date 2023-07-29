import {I18nManager} from 'react-native';
import {isRtlLang} from 'rtl-detect';

import {loadLocale as loadLocaleCommon} from './i18n_base';

export let isRTL = false;

const loadStatuses: Record<string, boolean> = {};

export function loadLocale(targetLocale: string) {
  if (loadStatuses[targetLocale]) return;
  const detectedLocale = loadLocaleCommon(targetLocale);
  loadStatuses[targetLocale] = true;
  isRTL = !!isRtlLang(detectedLocale);
  I18nManager.allowRTL(isRTL);
  I18nManager.forceRTL(isRTL);
}
