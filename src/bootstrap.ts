import {i18n} from '@lingui/core';
import {loadLocale} from '@/i18n';
import {settings} from '@/store/settings';

let bootstraped = false;

export function bootstrap() {
  if (bootstraped) return;
  const state = settings.getState();
  try {
    loadLocale(state['SELECTED_LOCALE']);
    bootstraped = true;
  } catch {
    console.warn(
      'could not find any matching file for locale: ' +
        state['SELECTED_LOCALE'],
    );
    i18n.activate('en');
  }
}
