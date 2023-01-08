import {LogBox, AppRegistry} from 'react-native';

if (__DEV__) {
  LogBox.ignoreLogs([
    'new NativeEventEmitter',
    'UNSAFE_componentWillReceiveProps',
    'UNSAFE_componentWillMount',
    '[DEPRECATED] `getStorage`',
  ]);
}

import {App} from '@/app';
import {BaseComponent} from '@/base_component';
import {bootstrap} from '@/bootstrap';
import {APP_KEY} from '@/constants/app';
import WidgetMod from '@/modules/screen_widget';
import {setupNotifeeHandlers} from '@/notifee';
import {setNextAdhan} from '@/tasks/set_next_adhan';
import {setReminders} from '@/tasks/set_reminder';
import {setUpdateWidgetsAlarms} from '@/tasks/set_update_widgets_alarms';
import {updateWidgets} from '@/tasks/update_widgets';

setupNotifeeHandlers();

WidgetMod.onUpdateScreenWidgetRequested(async () => {
  bootstrap();
  setUpdateWidgetsAlarms();
  await updateWidgets();
});

AppRegistry.registerRunnable(APP_KEY, async initialProps => {
  bootstrap();
  setNextAdhan();
  setReminders();
  setUpdateWidgetsAlarms();
  updateWidgets();
  AppRegistry.registerComponent(APP_KEY, () => BaseComponent.bind(this, App));
  AppRegistry.runApplication(APP_KEY, initialProps);
});
