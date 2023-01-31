import HeaderTitle from '@react-navigation/elements/src/Header/HeaderTitle';
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useColorMode} from 'native-base';
import {useEffect} from 'react';
import {Intro} from '@/intro';
import {
  getCurrentRoute,
  navigationRef,
  onReady,
} from '@/navigation/root_navigation';
import {RootStackParamList, translateRoute} from '@/navigation/types';
import FullscreenAlarm from '@/screens/fullscreen_alarm';
import {Home} from '@/screens/home';
import Settings from '@/screens/settings';
import {AboutSettings} from '@/screens/settings_about';
import {AdhanSettings} from '@/screens/settings_adhan';
import {BatteryOptimizationSettings} from '@/screens/settings_battery_optimizations';
import {CalculationSettings} from '@/screens/settings_calculation';
import {DisplaySettings} from '@/screens/settings_display';
import {LocationSettings} from '@/screens/settings_location';
import {NotificationSettings} from '@/screens/settings_notifications';
import {RemindersSettings} from '@/screens/settings_reminders';
import {WidgetSettings} from '@/screens/settings_widget';
import {useSettings} from '@/store/settings';
import {setNextAdhan} from '@/tasks/set_next_adhan';
import {setReminders} from '@/tasks/set_reminder';
import {setUpdateWidgetsAlarms} from '@/tasks/set_update_widgets_alarms';
import {updateWidgets} from '@/tasks/update_widgets';

const Stack = createNativeStackNavigator<RootStackParamList>();

const TranslatedHeaderTitle = (...props: any[]) => {
  const routeName = getCurrentRoute().name;
  if (routeName) {
    return <HeaderTitle {...props}>{translateRoute(routeName)}</HeaderTitle>;
  } else {
    return <></>;
  }
};

export function App(): JSX.Element {
  const [appIntroDone] = useSettings('APP_INTRO_DONE');
  const {colorMode} = useColorMode();

  const isDarkMode = colorMode === 'dark';

  useEffect(() => {
    setNextAdhan();
    setReminders();
    setUpdateWidgetsAlarms();
    updateWidgets();
  }, []);

  if (!appIntroDone) {
    return <Intro></Intro>;
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={onReady}
      theme={isDarkMode ? DarkTheme : DefaultTheme}>
      <Stack.Navigator
        screenOptions={{
          headerTitle: TranslatedHeaderTitle,
        }}>
        <Stack.Group screenOptions={{headerShown: false}}>
          <Stack.Screen name="Home" component={Home} />
        </Stack.Group>
        <Stack.Group>
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="DisplaySettings" component={DisplaySettings} />
          <Stack.Screen name="LocationSettings" component={LocationSettings} />
          <Stack.Screen
            name="NotificationSettings"
            component={NotificationSettings}
          />
          <Stack.Screen name="AdhanSettings" component={AdhanSettings} />
          <Stack.Screen
            name="CalculationSettings"
            component={CalculationSettings}
          />
          <Stack.Screen
            name="BatteryOptimizationSettings"
            component={BatteryOptimizationSettings}
          />
          <Stack.Screen name="WidgetSettings" component={WidgetSettings} />
          <Stack.Screen
            name="RemindersSettings"
            component={RemindersSettings}
          />
          <Stack.Screen name="AboutSettings" component={AboutSettings} />
        </Stack.Group>
        <Stack.Group
          screenOptions={{presentation: 'modal', headerShown: false}}>
          <Stack.Screen name="FullscreenAlarm" component={FullscreenAlarm} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
