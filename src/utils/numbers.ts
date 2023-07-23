import {settings} from '@/store/settings';

let SELECTED_LOCALE = settings.getState().SELECTED_LOCALE;

settings.subscribe(state => (SELECTED_LOCALE = state.SELECTED_LOCALE));

export function formatNumber(num: number) {
  return new Intl.NumberFormat(SELECTED_LOCALE).format(num);
}

export function sumFloats(n1: number, n2: number, precision = 2) {
  return parseFloat((n1 + n2).toFixed(precision));
}
