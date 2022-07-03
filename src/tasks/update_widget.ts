import {
  cancelPermanentNotifWidget,
  updatePermanentNotifWidget,
} from '@/notifee';
import {settings} from '@/store/settings';

export function updateWidget() {
  if (settings.getState().SHOW_WIDGET) {
    updatePermanentNotifWidget();
  } else {
    cancelPermanentNotifWidget();
  }
}
