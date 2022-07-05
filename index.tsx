import {ChunkManager} from '@callstack/repack/dist/client/api/ChunkManager';

import {AppRegistry} from 'react-native';
import {App} from '@/app';
import {BaseComponent} from '@/base_component';
import {bootstrap} from '@/bootstrap';
import {APP_KEY} from '@/constants/app';
import WidgetMod from '@/modules/screen_widget';
import {setupNotifeeHandlers} from '@/notifee';
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
  await bootstrap();
  await updateWidgets();
});

AppRegistry.registerRunnable(APP_KEY, async initialProps => {
  await bootstrap();
  setNextAdhan();
  updateWidgets();
  AppRegistry.registerComponent(APP_KEY, () => BaseComponent.bind(this, App));
  AppRegistry.runApplication(APP_KEY, initialProps);
});
