import {ChunkManager} from '@callstack/repack/dist/client/api/ChunkManager';
import {AppRegistry} from 'react-native';
import {App} from '@/app';
import {BaseComponent} from '@/base_component';
import {APP_KEY} from '@/constants/app';
import {i18n, loadLocale} from '@/i18n';
import {setupNotifeeHandlers} from '@/notifee';
import {PREFERRED_LOCALE} from '@/utils/locale';

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
    try {
      await loadLocale(PREFERRED_LOCALE);
    } catch {
      console.warn(
        'could not find any matching file for locale: ' + PREFERRED_LOCALE,
      );
      i18n.activate('en');
    }
    AppRegistry.registerComponent(APP_KEY, () => BaseComponent.bind(this, App));
    AppRegistry.runApplication(APP_KEY, initialProps);
  } catch (err) {
    console.log(err);
  }
});
