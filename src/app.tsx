import HeaderTitle from '@react-navigation/elements/src/Header/HeaderTitle';
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HStack, Text} from 'native-base';
import {useEffect, useLayoutEffect, useMemo} from 'react';
import {useStore} from 'zustand';
import {AdvancedCustomAdhanToggle} from './components/advanced_custom_adhan_toggle';
import {FavoriteLocations} from './screens/favorite_locations';
import {MonthlyView} from './screens/monthly_view';
import {shouldShowRamadanNotice, showRamadanAlert} from './utils/ramadan';
import {OrientationLock} from '@/components/orientation_lock';
import {QadaHistoryToggle} from '@/components/qada_history_toggle';
import {Intro} from '@/intro';
import {
  getCurrentRoute,
  navigationRef,
  onReady,
  replace,
} from '@/navigation/root_navigation';
import {RootStackParamList, translateRoute} from '@/navigation/types';
import {FullscreenAlarm} from '@/screens/fullscreen_alarm';
import {Home} from '@/screens/home';
import {QadaCounter} from '@/screens/qada_counter';
import {QiblaFinder} from '@/screens/qibla_finder';
import {QiblaCompass} from '@/screens/qibla_finder_compass';
import {QiblaMap} from '@/screens/qibla_finder_map';
import Settings from '@/screens/settings';
import {AboutSettings} from '@/screens/settings_about';
import {AdhanSettings} from '@/screens/settings_adhan';
import {BackupSettings} from '@/screens/settings_backup';
import {CalculationSettings} from '@/screens/settings_calculation';
import {DevSettings} from '@/screens/settings_dev';
import {DisplaySettings} from '@/screens/settings_display';
import {FixCommonProblemsSettings} from '@/screens/settings_fix_common_problems';
import {LocationSettings} from '@/screens/settings_location';
import {NotificationSettings} from '@/screens/settings_notifications';
import {RemindersSettings} from '@/screens/settings_reminders';
import {WidgetSettings} from '@/screens/settings_widget';
import {settings} from '@/store/settings';
import {setNextAdhan} from '@/tasks/set_next_adhan';
import {setReminders} from '@/tasks/set_reminder';
import {setUpdateWidgetsAlarms} from '@/tasks/set_update_widgets_alarms';
import {updateWidgets} from '@/tasks/update_widgets';

const Stack = createNativeStackNavigator<RootStackParamList>();

const TranslatedHeaderTitle = function TranslatedHeaderTitle() {
  const routeName = getCurrentRoute().name;
  if (routeName) {
    return <HeaderTitle>{translateRoute(routeName)}</HeaderTitle>;
  } else {
    return <></>;
  }
};

const QiblaFinderHeaderRight = function QiblaFinderHeaderRight() {
  return (
    <HStack>
      <OrientationLock p="2" mr="-2" size="xl"></OrientationLock>
    </HStack>
  );
};

const QadaCounterHeaderRight = function QadaCounterHeaderRight() {
  return (
    <HStack>
      <QadaHistoryToggle p="2" mr="-2" size="xl"></QadaHistoryToggle>
    </HStack>
  );
};

const SettingsAdhanHeaderRight = function SettingsAdhanHeaderRight() {
  return (
    <HStack>
      <AdvancedCustomAdhanToggle fontSize="sm"></AdvancedCustomAdhanToggle>
    </HStack>
  );
};

const SubtitleHeaderRight = function SubtitleHeaderRight() {
  const {subtitle = ''} = getCurrentRoute().params || ({} as any);
  return <Text>{subtitle}</Text>;
};

export function App({themeColor}: {themeColor: 'dark' | 'light'}): JSX.Element {
  const appIntroDone = useStore(settings, s => s.APP_INTRO_DONE);
  const isPlayingAudio = useStore(settings, s => s.IS_PLAYING_AUDIO);

  const navigationTheme = useMemo(
    () => (themeColor === 'dark' ? DarkTheme : DefaultTheme),
    [themeColor],
  );

  useEffect(() => {
    setNextAdhan();
    setReminders();
    setUpdateWidgetsAlarms();
    updateWidgets();
  }, []);

  useLayoutEffect(() => {
    if (isPlayingAudio) {
      replace('FullscreenAlarm');
    }
  }, [isPlayingAudio]);

  useEffect(() => {
    if (appIntroDone && shouldShowRamadanNotice()) {
      showRamadanAlert();
    }
  }, [appIntroDone]);

  if (!appIntroDone) {
    return <Intro></Intro>;
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={onReady}
      theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerTitle: TranslatedHeaderTitle,
          animation: 'fade',
        }}
        initialRouteName="Home">
        <Stack.Group screenOptions={{headerShown: false}}>
          <Stack.Screen
            name="Home"
            component={Home}
            options={{animation: 'none'}}
          />
        </Stack.Group>
        <Stack.Group>
          <Stack.Screen
            name="FavoriteLocations"
            component={FavoriteLocations}
          />
          <Stack.Screen
            name="MonthlyView"
            component={MonthlyView}
            options={{headerRight: SubtitleHeaderRight}}
          />
          <Stack.Screen
            name="QadaCounter"
            component={QadaCounter}
            options={{headerRight: QadaCounterHeaderRight}}
          />
          <Stack.Screen name="QiblaFinder" component={QiblaFinder} />
          <Stack.Screen
            name="QiblaMap"
            component={QiblaMap}
            options={{headerRight: QiblaFinderHeaderRight}}
          />
          <Stack.Screen
            name="QiblaCompass"
            component={QiblaCompass}
            options={{headerRight: QiblaFinderHeaderRight}}
          />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="BackupSettings" component={BackupSettings} />
          <Stack.Screen name="DisplaySettings" component={DisplaySettings} />
          <Stack.Screen name="LocationSettings" component={LocationSettings} />
          <Stack.Screen
            name="NotificationSettings"
            component={NotificationSettings}
          />
          <Stack.Screen
            name="AdhanSettings"
            component={AdhanSettings}
            options={{headerRight: SettingsAdhanHeaderRight}}
          />
          <Stack.Screen
            name="CalculationSettings"
            component={CalculationSettings}
          />
          <Stack.Screen
            name="FixCommonProblemsSettings"
            component={FixCommonProblemsSettings}
          />
          <Stack.Screen name="WidgetSettings" component={WidgetSettings} />
          <Stack.Screen
            name="RemindersSettings"
            component={RemindersSettings}
          />
          <Stack.Screen name="AboutSettings" component={AboutSettings} />
          <Stack.Screen name="DevSettings" component={DevSettings} />
        </Stack.Group>
        <Stack.Group
          screenOptions={{presentation: 'modal', headerShown: false}}>
          <Stack.Screen name="FullscreenAlarm" component={FullscreenAlarm} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
