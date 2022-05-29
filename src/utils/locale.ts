import {Platform, NativeModules} from 'react-native';

export const DEFAULT_LOCALE = 'en';

export const PREFERRED_LOCALE = getPreferredLocale();

function getPreferredLocale() {
  let locale;
  if (Platform.OS === 'ios') {
    locale =
      NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
      NativeModules.SettingsManager?.settings?.AppleLocale;
  } else {
    locale = NativeModules.I18nManager.localeIdentifier;
  }

  if (!locale) {
    locale = 'en-US';
  }
  return locale.replace(/_/g, '-');
}
