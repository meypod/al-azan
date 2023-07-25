import {t} from '@lingui/macro';
import {Button, HStack, ScrollView, Stack, Text} from 'native-base';
import {useCallback, useEffect, useMemo, useState} from 'react';
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
import {CachedPrayerTimes} from '@/store/adhan_calc_cache';
import {calcSettings} from '@/store/calculation';
import {homeStore} from '@/store/home';
import {settings} from '@/store/settings';

import {getArabicDate, getDayName, getFormattedDate} from '@/utils/date';
import useNoInitialEffect from '@/utils/hooks/use_no_initial_effect';
import {askPermissions} from '@/utils/permission';

type DayDetails = {
  dateString: string;
  dayName: string;
  arabicDate: string;
  isToday: boolean;
};

function getDayDetails(date: Date): DayDetails {
  return {
    dayName: getDayName(date),
    dateString: getFormattedDate(date),
    arabicDate: getArabicDate(date),
    isToday: date.toDateString() === new Date().toDateString(),
  };
}

export function Home() {
  const {
    currentDate,
    increaseCurrentDateByOne,
    decreaseCurrentDateByOne,
    updateCurrentDate,
    resetCurrentDate,
  } = useStore(
    homeStore,
    state => ({
      currentDate: state.date,
      increaseCurrentDateByOne: state.increaseCurrentDateByOne,
      decreaseCurrentDateByOne: state.decreaseCurrentDateByOne,
      updateCurrentDate: state.updateCurrentDate,
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

  const [prayerTimes, setPrayerTimes] = useState<CachedPrayerTimes | undefined>(
    getPrayerTimes(currentDate),
  );

  const [day, setDay] = useState<DayDetails>(getDayDetails(currentDate));

  useNoInitialEffect(() => {
    setDay(getDayDetails(currentDate));
    setPrayerTimes(getPrayerTimes(currentDate));
  }, [currentDate]);

  useEffect(() => {
    void askPermissions();
  }, []);

  useNoInitialEffect(() => {
    updateCurrentDate();
  }, [impactfulSettings, updateCurrentDate]);

  const goToLocations = useCallback(() => navigate('FavoriteLocations'), []);

  const locationText = useMemo(() => {
    if (location) {
      if (location.label) {
        return location.label;
      }
      if (location.city) {
        return location.city.selectedName || location.city.name;
      }

      if (location.lat && location.long) {
        const latString =
          Math.abs(location.lat).toFixed(2) +
          (location.lat > 0 ? '° N' : '° S');
        const longString =
          Math.abs(location.long).toFixed(2) +
          (location.long > 0 ? '° E' : '° W');
        return latString + ', ' + longString;
      }
      return '';
    } else {
      return '';
    }
  }, [location]);

  return (
    <SafeArea>
      <ScrollView>
        <Stack flex={1} alignItems="center" pb="4">
          <HStack
            mb="-3"
            px="3"
            justifyContent="space-between"
            alignItems="center"
            w="100%">
            <HStack alignItems="center">
              <Text>{day.dateString}</Text>
            </HStack>

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
            {!day.isToday && (
              <Button
                onPress={resetCurrentDate}
                variant="outline"
                py="2"
                px="1"
                flexShrink={1}
                _text={{
                  adjustsFontSizeToFit: true,
                  fontSize: 'xs',
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
          <Text key={impactfulSettings.SELECTED_ARABIC_CALENDAR}>
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
    </SafeArea>
  );
}
