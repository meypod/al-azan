import {settings} from '@/store/settings';

let SELECTED_LOCALE = settings.getState().SELECTED_LOCALE;

settings.subscribe(state => (SELECTED_LOCALE = state.SELECTED_LOCALE));

export function formatNumber(num: number) {
  return new Intl.NumberFormat(SELECTED_LOCALE).format(num);
}
