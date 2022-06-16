import {ChunkManager} from '@callstack/repack/dist/client/api/ChunkManager';
import {i18n} from '@lingui/core';
import {AppRegistry} from 'react-native';
import {App} from '@/app';
import {BaseComponent} from '@/base_component';
import {APP_KEY} from '@/constants/app';
import {SELECTED_LANGUAGE} from '@/constants/settings';
import {loadLocale} from '@/i18n';
import {setupNotifeeHandlers} from '@/notifee';
import {setupDefaultSettings} from '@/store/settings';

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
    const settings = await setupDefaultSettings();
    try {
      await loadLocale(settings.get(SELECTED_LANGUAGE));
    } catch {
      console.warn(
        'could not find any matching file for locale: ' +
          settings.get(SELECTED_LANGUAGE),
      );
      i18n.activate('en');
    }
    AppRegistry.registerComponent(APP_KEY, () => BaseComponent.bind(this, App));
    AppRegistry.runApplication(APP_KEY, initialProps);
  } catch (err) {
    console.log(err);
  }
});
