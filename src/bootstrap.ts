import {i18n} from '@lingui/core';
import {loadLocale} from '@/i18n';
import {waitTillHydration as waitTillCalcSettingHydration} from '@/store/calculation_settings';
import {settings, waitTillHydration} from '@/store/settings';

export async function bootstrap() {
  await Promise.all([waitTillHydration(), waitTillCalcSettingHydration()]);
  const state = settings.getState();
  try {
    await loadLocale(state['SELECTED_LOCALE']);
  } catch {
    console.warn(
      'could not find any matching file for locale: ' +
        state['SELECTED_LOCALE'],
    );
    i18n.activate('en');
  }
}
