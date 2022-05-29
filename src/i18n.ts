import {i18n} from '@lingui/core';
export {i18n} from '@lingui/core';

import {isRtlLang} from 'rtl-detect';

import {messages as enMessages} from '../locales/en/messages.mjs';

i18n.load('en', enMessages);

let isLocaleRTL = false;

export function isRTL() {
  return isLocaleRTL;
}

export async function loadLocale(locale: string) {
  if (locale in i18n.messages) {
    i18n.activate(locale);
    return;
  }
  try {
    const {messages} = await import(
      /* webpackInclude: /\.mjs$/ */
      /* webpackExclude: /\.po$/ */
      /* webpackMode: "lazy-once" */
      `../locales/${locale}/messages.mjs`
    );
    if (messages) {
      i18n.load(locale, messages);
      isLocaleRTL = !!isRtlLang(locale);
      i18n.activate(locale);
    } else {
      throw new Error('import failed');
    }
  } catch {
    const baseLocale = locale.split('-').at(0);
    if (baseLocale) {
      try {
        await loadLocale(baseLocale);
      } catch {
        throw new Error(
          'could not find any matching file for locale: ' + locale,
        );
      }
    }
  }
}
