import {i18n} from '@lingui/core';
import {
  en,
  ar,
  fa,
  id,
  ur,
  de,
  fr,
  hi,
  tr,
  bs,
  vi,
  bn,
} from 'make-plural/plurals';

import {messages as arMessages} from '../locales/ar/messages';
import {messages as bnMessages} from '../locales/bn/messages';
import {messages as bsMessages} from '../locales/bs/messages';
import {messages as deMessages} from '../locales/de/messages';
import {messages as enMessages} from '../locales/en/messages';
import {messages as faMessages} from '../locales/fa/messages';
import {messages as frMessages} from '../locales/fr/messages';
import {messages as hiMessages} from '../locales/hi/messages';
import {messages as idMessages} from '../locales/id/messages';
import {messages as trMessages} from '../locales/tr/messages';
import {messages as urMessages} from '../locales/ur/messages';
import {messages as viMessages} from '../locales/vi/messages';

i18n.loadLocaleData({
  en: {plurals: en},
  fa: {plurals: fa},
  ar: {plurals: ar},
  de: {plurals: de},
  fr: {plurals: fr},
  hi: {plurals: hi},
  id: {plurals: id},
  tr: {plurals: tr},
  ur: {plurals: ur},
  bs: {plurals: bs},
  vi: {plurals: vi},
  bn: {plurals: bn},
});

export const localeFallbacks = [
  {
    base: 'en',
    fallback: 'en',
    messages: enMessages,
  },
  {
    base: 'fa',
    fallback: 'fa',
    messages: faMessages,
  },
  {
    base: 'ar',
    fallback: 'ar',
    messages: arMessages,
  },
  {
    base: 'de',
    fallback: 'de',
    messages: deMessages,
  },
  {
    base: 'fr',
    fallback: 'fr',
    messages: frMessages,
  },
  {
    base: 'hi',
    fallback: 'hi',
    messages: hiMessages,
  },
  {
    base: 'id',
    fallback: 'id',
    messages: idMessages,
  },
  {
    base: 'tr',
    fallback: 'tr',
    messages: trMessages,
  },
  {
    base: 'ur',
    fallback: 'ur',
    messages: urMessages,
  },
  {
    base: 'bs',
    fallback: 'bs',
    messages: bsMessages,
  },
  {
    base: 'vi',
    fallback: 'vi',
    messages: viMessages,
  },
  {
    base: 'bn',
    fallback: 'bn',
    messages: bnMessages,
  },
];

/**
 * @param targetLocale defaults to 'en'
 */
export function loadLocale(targetLocale?: string) {
  let locale;
  let messages;

  if (targetLocale) {
    for (const lf of localeFallbacks) {
      if (targetLocale.startsWith(lf.base)) {
        locale = lf.fallback;
        messages = lf.messages;
        break;
      }
    }
  }

  if (!locale) {
    locale = 'en';
    messages = enMessages;
  }

  i18n.load(locale, messages as any);
  i18n.activate(locale);

  return locale;
}

export {i18n};
