import {ChunkManager} from '@callstack/repack/dist/client/api/ChunkManager';
import {i18n} from '@lingui/core';
import {AppRegistry} from 'react-native';
import {App} from '@/app';
import {BaseComponent} from '@/base_component';
import {APP_KEY} from '@/constants/app';
import {loadLocale} from '@/i18n';
import WidgetMod from '@/modules/screen_widget';
import {setupNotifeeHandlers} from '@/notifee';
import {waitTillHydration as waitTillCalcSettingHydration} from '@/store/calculation_settings';
import {settings, waitTillHydration} from '@/store/settings';
import {setNextAdhan} from '@/tasks/set_next_adhan';
import {updateWidgets} from '@/tasks/update_widgets';

ChunkManager.configure({
  resolveRemoteChunk: async chunkid => {
    return {
      url: 'file:///' + chunkid,
    };
  },
});

setupNotifeeHandlers();

WidgetMod.onUpdateScreenWidgetRequested(async () => {
  await Promise.all([waitTillHydration(), waitTillCalcSettingHydration()]);
  await updateWidgets();
});

AppRegistry.registerRunnable(APP_KEY, async initialProps => {
  try {
    await Promise.all([waitTillHydration(), waitTillCalcSettingHydration()]);
    const state = settings.getState();
    try {
      await loadLocale(state['SELECTED_LOCALE']);
      setNextAdhan();
      updateWidgets();
    } catch {
      console.warn(
        'could not find any matching file for locale: ' +
          state['SELECTED_LOCALE'],
      );
      i18n.activate('en');
    }
    AppRegistry.registerComponent(APP_KEY, () => BaseComponent.bind(this, App));
    AppRegistry.runApplication(APP_KEY, initialProps);
  } catch (err) {
    console.log(err);
  }
});
