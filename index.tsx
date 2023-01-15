import {App} from '@/app';
import {BaseComponent} from '@/base_component';
import {bootstrap} from '@/bootstrap';
import {LogBox, AppRegistry} from 'react-native';
import {onUpdateScreenWidgetRequested} from '@/modules/screen_widget';
import {setupNotifeeHandlers} from '@/notifee';
import fullscreen_alarm from '@/screens/fullscreen_alarm';
import {homeStore} from '@/store/home';
import {setNextAdhan} from '@/tasks/set_next_adhan';
import {setReminders} from '@/tasks/set_reminder';
import {setUpdateWidgetsAlarms} from '@/tasks/set_update_widgets_alarms';
import {updateWidgets} from '@/tasks/update_widgets';

if (__DEV__) {
  LogBox.ignoreLogs([
    'new NativeEventEmitter',
    'UNSAFE_componentWillReceiveProps',
    'UNSAFE_componentWillMount',
  ]);
}

setupNotifeeHandlers();

onUpdateScreenWidgetRequested(async () => {
  bootstrap();
  setUpdateWidgetsAlarms();
  await updateWidgets();
  // probably home screen needs updating too, if its visible
  homeStore.getState().updateCurrentDate();
});

AppRegistry.registerRunnable('main-app', async initialProps => {
  bootstrap();
  setNextAdhan();
  setReminders();
  setUpdateWidgetsAlarms();
  updateWidgets();
  AppRegistry.registerComponent('main-app', () =>
    BaseComponent.bind(this, App),
  );
  AppRegistry.runApplication('main-app', initialProps);
});

AppRegistry.registerRunnable('fs-alarm', async initialProps => {
  bootstrap();
  AppRegistry.registerComponent('fs-alarm', () =>
    BaseComponent.bind(this, fullscreen_alarm),
  );
  AppRegistry.runApplication('fs-alarm', initialProps);
});
