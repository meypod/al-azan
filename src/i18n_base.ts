import {i18n} from '@lingui/core';
import {en, ar, fa, id, ur, de, fr, hi, tr, bs} from 'make-plural/plurals';

import {messages as arMessages} from '../locales/ar/messages.mjs';
import {messages as bsMessages} from '../locales/bs/messages.mjs';
import {messages as deMessages} from '../locales/de/messages.mjs';
import {messages as enMessages} from '../locales/en/messages.mjs';
import {messages as faMessages} from '../locales/fa/messages.mjs';
import {messages as frMessages} from '../locales/fr/messages.mjs';
import {messages as hiMessages} from '../locales/hi/messages.mjs';
import {messages as idMessages} from '../locales/id/messages.mjs';
import {messages as trMessages} from '../locales/tr/messages.mjs';
import {messages as urMessages} from '../locales/ur/messages.mjs';

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
});

const localeFallbacks = [
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
