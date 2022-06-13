import {i18n} from '@lingui/core';
import HeaderTitle from '@react-navigation/elements/src/Header/HeaderTitle';
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useColorMode} from 'native-base';
import {useEffect, useRef} from 'react';
import {AppState} from 'react-native';
import {APP_INTRO_DONE} from '@/constants/settings';
import {Intro} from '@/intro';
import {
  getCurrentRoute,
  navigationRef,
  onReady,
} from '@/navigation/root_navigation';
import {RootStackParamList, routeTranslations} from '@/navigation/types';
import {FullscreenAlarm} from '@/screens/fullscreen_alarm';
import {Home} from '@/screens/home';
import {Settings} from '@/screens/settings';
import {BatteryOptimizationSettings} from '@/screens/settings/components/BatteryOptimizationSettings';
import {CalculationSettings} from '@/screens/settings/components/CalculationSettings';
import {DisplaySettings} from '@/screens/settings/components/DisplaySettings';
import {LocationSettings} from '@/screens/settings/components/LocationSettings';
import {NotificationSettings} from '@/screens/settings/components/NotificationSettings';
import {useStoreHelper as useSettingStore} from '@/store/settings';
import {setNextAdhan} from '@/tasks/set_next_adhan';

const Stack = createNativeStackNavigator<RootStackParamList>();

const TranslatedHeaderTitle = (...props: any[]) => {
  const routeName = getCurrentRoute().name;
  if (routeName) {
    return (
      <HeaderTitle {...props}>
        {i18n._(routeTranslations[routeName])}
      </HeaderTitle>
    );
  } else {
    return <></>;
  }
};

export function App() {
  const [appIntroDone] = useSettingStore<boolean>(APP_INTRO_DONE);
  const {colorMode} = useColorMode();

  const isDarkMode = colorMode === 'dark';

  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        setNextAdhan();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
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
          <Stack.Screen
            name="CalculationSettings"
            component={CalculationSettings}
          />
          <Stack.Screen
            name="BatteryOptimizationSettings"
            component={BatteryOptimizationSettings}
          />
        </Stack.Group>
        <Stack.Group
          screenOptions={{presentation: 'modal', headerShown: false}}>
          <Stack.Screen name="FullscreenAlarm" component={FullscreenAlarm} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
