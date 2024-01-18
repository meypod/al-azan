import {t} from '@lingui/macro';
import {Button, HStack, ScrollView, Stack, Text} from 'native-base';
import {useCallback, useEffect, useMemo} from 'react';
import {
  Gesture,
  GestureDetector,
  Directions,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import {useStore} from 'zustand';
import {shallow} from 'zustand/shallow';
import {getPrayerTimes} from '@/adhan';
import {AddCircleIcon} from '@/assets/icons/material_icons/add_circle';
import {ExploreIcon} from '@/assets/icons/material_icons/explore';
import {RestoreIcon} from '@/assets/icons/material_icons/restore';
import {SettingsSharpIcon} from '@/assets/icons/material_icons/settings_sharp';
import {UpdateIcon} from '@/assets/icons/material_icons/update';
import Divider from '@/components/Divider';
import PrayerTimesBox from '@/components/PrayerTimesBox';
import {SafeArea} from '@/components/safe_area';
import {isRTL} from '@/i18n';

import {navigate} from '@/navigation/root_navigation';

import {translateRoute} from '@/navigation/types';
import {SettingsWasImportedKey} from '@/screens/settings_backup/import_settings';
import {calcSettings} from '@/store/calculation';
import {homeStore} from '@/store/home';
import {settings} from '@/store/settings';
import {deleteItem, getItem} from '@/store/simple';

import {getArabicDate, getDayName, getFormattedDate} from '@/utils/date';
import {showBatteryOptimizationReminder} from '@/utils/dialogs';
import {useNoInitialEffect} from '@/utils/hooks/use_no_initial_effect';
import {getLocationLabel} from '@/utils/location';
import {askPermissions} from '@/utils/permission';
import {shouldShowRamadanNotice, showRamadanAlert} from '@/utils/ramadan';

type DayDetails = {
  dateString: string;
  dayName: string;
  arabicDate: string;
};

function getDayDetails(date: Date): DayDetails {
  return {
    dayName: getDayName(date),
    dateString: getFormattedDate(date),
    arabicDate: getArabicDate(date),
  };
}

export function Home() {
  const {
    currentDate,
    increaseCurrentDateByOne,
    decreaseCurrentDateByOne,
    resetCurrentDate,
    isNotToday,
  } = useStore(
    homeStore,
    state => ({
      currentDate: state.date,
      isNotToday: state.isNotToday,
      increaseCurrentDateByOne: state.increaseCurrentDateByOne,
      decreaseCurrentDateByOne: state.decreaseCurrentDateByOne,
      resetCurrentDate: state.resetCurrentDate,
    }),
    shallow,
  );

  const impactfulSettings = useStore(
    settings,
    s => ({
      NUMBERING_SYSTEM: s.NUMBERING_SYSTEM,
      SELECTED_ARABIC_CALENDAR: s.SELECTED_ARABIC_CALENDAR,
      SELECTED_SECONDARY_CALENDAR: s.SELECTED_SECONDARY_CALENDAR,
      CALC_SETTINGS_HASH: s.CALC_SETTINGS_HASH,
      HIDDEN_PRAYERS: s.HIDDEN_PRAYERS,
      DELIVERED_ALARM_TIMESTAMPS: s.DELIVERED_ALARM_TIMESTAMPS,
      HIGHLIGHT_CURRENT_PRAYER: s.HIGHLIGHT_CURRENT_PRAYER,
    }),
    shallow,
  );

  const location = useStore(calcSettings, s => s.LOCATION);

  const prayerTimes = useMemo(() => getPrayerTimes(currentDate), [currentDate]);

  const day = useMemo(() => getDayDetails(currentDate), [currentDate]);

  useEffect(() => {
    askPermissions().finally(async () => {
      if (getItem(SettingsWasImportedKey)) {
        await showBatteryOptimizationReminder().then(() => {
          deleteItem(SettingsWasImportedKey);
        });
      }
      if (shouldShowRamadanNotice()) {
        showRamadanAlert();
      }
    });
  }, []);

  useNoInitialEffect(() => {
    resetCurrentDate();
  }, [impactfulSettings, resetCurrentDate]);

  const goToLocations = useCallback(() => navigate('FavoriteLocations'), []);
  const goToMonthlyView = useCallback(() => navigate('MonthlyView'), []);

  const locationText = useMemo(() => getLocationLabel(location), [location]);

  const flingLeft = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(increaseCurrentDateByOne);
  const flingRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(decreaseCurrentDateByOne);

  return (
    <SafeArea>
      <GestureHandlerRootView style={{flex: 1}}>
        <GestureDetector gesture={flingLeft}>
          <GestureDetector gesture={flingRight}>
            <ScrollView>
              <Stack flex={1} alignItems="stretch" pb="4">
                <HStack
                  mb="-3"
                  px="3"
                  justifyContent="space-between"
                  alignItems="center">
                  <Text py="1" onPress={goToMonthlyView} flex={1}>
                    {day.dateString}
                  </Text>
                  <HStack alignItems="center">
                    <Button
                      accessibilityLabel={translateRoute('QadaCounter')}
                      p="2"
                      marginLeft="3"
                      variant="ghost"
                      onPress={() => {
                        navigate('QadaCounter');
                      }}>
                      <AddCircleIcon size="2xl" />
                    </Button>
                    <Button
                      accessibilityLabel={translateRoute('QiblaFinder')}
                      p="2"
                      variant="ghost"
                      onPress={() => {
                        navigate('QiblaFinder');
                      }}>
                      <ExploreIcon size="2xl" />
                    </Button>
                    <Button
                      accessibilityLabel={translateRoute('Settings')}
                      p="2"
                      marginRight="-3"
                      variant="ghost"
                      onPress={() => {
                        navigate('Settings');
                      }}>
                      <SettingsSharpIcon size="2xl" />
                    </Button>
                  </HStack>
                </HStack>
                <Divider
                  borderColor="coolGray.300"
                  mb="-2"
                  _text={{fontWeight: 'bold'}}>
                  {day.dayName}
                </Divider>
                <HStack
                  mt="2"
                  justifyContent="space-between"
                  alignItems="center"
                  flexWrap="wrap"
                  w="100%"
                  flexDirection={isRTL ? 'row-reverse' : 'row'}>
                  <Button variant="ghost" onPress={decreaseCurrentDateByOne}>
                    <Stack
                      flexDirection={isRTL ? 'row' : 'row-reverse'}
                      alignItems="center">
                      <Text fontSize="xs" mx="1">{t`Prev Day`}</Text>
                      <RestoreIcon size="xl" />
                    </Stack>
                  </Button>
                  {isNotToday && (
                    <Button
                      onPress={resetCurrentDate}
                      variant="outline"
                      py="2"
                      px="1"
                      flexShrink={1}
                      _text={{
                        adjustsFontSizeToFit: true,
                        fontSize: 'xs',
                        minimumFontScale: 0.8,
                        noOfLines: 1,
                        _light: {
                          color: 'primary.700',
                        },
                        _dark: {
                          color: 'primary.300',
                        },
                      }}
                      borderColor="primary.500">
                      {t`Show Today`}
                    </Button>
                  )}
                  <Button variant="ghost" onPress={increaseCurrentDateByOne}>
                    <Stack
                      flexDirection={isRTL ? 'row' : 'row-reverse'}
                      alignItems="center">
                      <UpdateIcon size="xl" />
                      <Text mx="1" fontSize="xs">{t`Next Day`}</Text>
                    </Stack>
                  </Button>
                </HStack>
                <PrayerTimesBox
                  pt="2.5"
                  prayerTimes={prayerTimes}
                  settings={impactfulSettings}
                />
                <Text
                  key={impactfulSettings.SELECTED_ARABIC_CALENDAR}
                  fontSize="md"
                  textAlign="center">
                  {day.arabicDate}
                </Text>
                {location && (
                  <Button
                    pt="1"
                    p="3"
                    accessibilityActions={[
                      {
                        name: 'activate',
                        label: t`See favorite locations`,
                      },
                    ]}
                    onPress={goToLocations}
                    onAccessibilityAction={goToLocations}
                    variant="unstyled">
                    <Text
                      borderBottomWidth={1}
                      borderColor="muted.300"
                      _dark={{
                        borderColor: 'muted.500',
                      }}>
                      {locationText}
                    </Text>
                  </Button>
                )}
              </Stack>
            </ScrollView>
          </GestureDetector>
        </GestureDetector>
      </GestureHandlerRootView>
    </SafeArea>
  );
}
