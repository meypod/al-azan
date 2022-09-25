import {ScriptManager, Script} from '@callstack/repack/client';

import {AppRegistry} from 'react-native';
import {App} from '@/app';
import {BaseComponent} from '@/base_component';
import {bootstrap} from '@/bootstrap';
import {APP_KEY} from '@/constants/app';
import WidgetMod from '@/modules/screen_widget';
import {setupNotifeeHandlers} from '@/notifee';
import {setNextAdhan} from '@/tasks/set_next_adhan';
import {setUpdateWidgetsAlarms} from '@/tasks/set_update_widgets_alarms';
import {updateWidgets} from '@/tasks/update_widgets';

ScriptManager.shared.addResolver(async scriptId => {
  // In development, get all the chunks from dev server.
  if (__DEV__) {
    return {
      url: Script.getDevServerURL(scriptId),
      cache: false,
    };
  }

  // In production, get chunks matching the regex from filesystem.
  if (/^.+\.local$/.test(scriptId)) {
    return {
      url: Script.getFileSystemURL(scriptId),
    };
  } else {
    return {
      url: Script.getRemoteURL(`https://my-domain.dev/${scriptId}`),
    };
  }
});

setupNotifeeHandlers();

WidgetMod.onUpdateScreenWidgetRequested(async () => {
  await bootstrap();
  setUpdateWidgetsAlarms();
  await updateWidgets();
});

AppRegistry.registerRunnable(APP_KEY, async initialProps => {
  await bootstrap();
  setNextAdhan();
  setUpdateWidgetsAlarms();
  updateWidgets();
  AppRegistry.registerComponent(APP_KEY, () => BaseComponent.bind(this, App));
  AppRegistry.runApplication(APP_KEY, initialProps);
});
