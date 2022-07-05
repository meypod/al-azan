import {i18n} from '@lingui/core';
import {en, ar, fa} from 'make-plural/plurals';
import {isRtlLang} from 'rtl-detect';

import {messages as enMessages} from '../locales/en/messages.mjs';

i18n.loadLocaleData({
  en: {plurals: en},
  fa: {plurals: fa},
  ar: {plurals: ar},
});
i18n.load('en', enMessages);

export let isRTL = false;

const loadStatuses: Record<string, boolean> = {};

const localeFallbacks = [
  {
    base: 'en',
    fallback: 'en',
  },
  {
    base: 'fa',
    fallback: 'fa',
  },
  {
    base: 'ar',
    fallback: 'ar',
  },
];

export async function loadLocale(targetLocale: string) {
  if (loadStatuses[targetLocale]) return;
  let locale;

  for (const lf of localeFallbacks) {
    if (targetLocale.startsWith(lf.base)) {
      locale = lf.fallback;
      break;
    }
  }
  if (!locale) locale = targetLocale;

  try {
    const {messages} = await import(
      /* webpackInclude: /\.mjs$/ */
      /* webpackExclude: /\.po$/ */
      /* webpackMode: "lazy-once" */
      `../locales/${locale}/messages.mjs`
    );
    if (messages) {
      i18n.load(locale, messages);
      isRTL = isRtlLang(locale)!;
      i18n.activate(locale);
      loadStatuses[targetLocale] = true;
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
