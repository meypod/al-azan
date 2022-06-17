import {ChunkManager} from '@callstack/repack/dist/client/api/ChunkManager';
import {i18n} from '@lingui/core';
import {AppRegistry} from 'react-native';
import {App} from '@/app';
import {BaseComponent} from '@/base_component';
import {APP_KEY} from '@/constants/app';
import {loadLocale} from '@/i18n';
import {setupNotifeeHandlers} from '@/notifee';
import {waitTillHydration as waitTillCalcSettingHydration} from '@/store/calculation_settings';
import {settings, waitTillHydration} from '@/store/settings';
import {restart} from '@/utils/restart';

ChunkManager.configure({
  resolveRemoteChunk: async chunkid => {
    return {
      url: 'file:///' + chunkid,
    };
  },
});

setupNotifeeHandlers();

AppRegistry.registerRunnable(APP_KEY, async initialProps => {
  try {
    await Promise.all([waitTillHydration(), waitTillCalcSettingHydration()]);
    const state = settings.getState();
    if (state.RESTART_PENDING) {
      settings.setState({RESTART_PENDING: false});
      return restart();
    }
    try {
      await loadLocale(state['SELECTED_LOCALE']);
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
