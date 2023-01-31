import {LogBox, AppRegistry} from 'react-native';
import {App} from '@/app';
import {BaseComponent} from '@/base_component';
import {bootstrap} from '@/bootstrap';
import {onUpdateScreenWidgetRequested} from '@/modules/screen_widget';
import {setupNotifeeHandlers} from '@/notifee';
import fullscreen_alarm from '@/screens/fullscreen_alarm';
import {setUpdateWidgetsAlarms} from '@/tasks/set_update_widgets_alarms';
import {updateWidgets} from '@/tasks/update_widgets';

if (__DEV__) {
  LogBox.ignoreLogs([
    'UNSAFE_componentWillReceiveProps',
    'UNSAFE_componentWillMount',
  ]);
}

setupNotifeeHandlers();

onUpdateScreenWidgetRequested(async () => {
  bootstrap();
  await Promise.all([setUpdateWidgetsAlarms(), updateWidgets()]);
});

AppRegistry.registerRunnable('main-app', async initialProps => {
  bootstrap();
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
