import {LogBox, AppRegistry} from 'react-native';
import {App} from '@/app';
import {BaseComponent} from '@/base_component';
import {bootstrap} from '@/bootstrap';
import {handleDemoCommands} from '@/modules/activity';
import {onUpdateScreenWidgetRequested} from '@/modules/screen_widget';
import {setupNotifeeHandlers} from '@/notifee';
import {FullscreenAlarm} from '@/screens/fullscreen_alarm';
import {setUpdateWidgetsAlarms} from '@/tasks/set_update_widgets_alarms';
import {updateWidgets} from '@/tasks/update_widgets';

if (__DEV__) {
  const ignoreWarns = [
    'UNSAFE_componentWillReceiveProps',
    'UNSAFE_componentWillMount',
    'If you do not provide children, you must specify an aria-label for accessibility',
    'In React 18, SSRProvider is not necessary and is a noop. You can remove it from your app',
  ];

  const warn = console.warn;
  console.warn = (...arg) => {
    for (const warning of ignoreWarns) {
      if (arg[0].startsWith(warning)) {
        return;
      }
    }
    warn(...arg);
  };
  LogBox.ignoreLogs(ignoreWarns);
}

setupNotifeeHandlers();

onUpdateScreenWidgetRequested(async () => {
  bootstrap();
  await Promise.all([setUpdateWidgetsAlarms(), updateWidgets()]);
});

handleDemoCommands();

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
    BaseComponent.bind(this, FullscreenAlarm),
  );
  AppRegistry.runApplication('fs-alarm', initialProps);
});
