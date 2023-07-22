import {t} from '@lingui/macro';
import {Button, Flex, HStack, ScrollView, Stack, Text} from 'native-base';
import {useEffect, useState} from 'react';
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
import {isRTL} from '@/i18n';

import {navigate} from '@/navigation/root_navigation';

import {CachedPrayerTimes} from '@/store/adhan_calc_cache';
import {homeStore} from '@/store/home';
import {settings} from '@/store/settings';

import {getArabicDate, getDayName, getFormattedDate} from '@/utils/date';
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
  const [
    currentDate,
    increaseCurrentDateByOne,
    decreaseCurrentDateByOne,
    updateCurrentDate,
    resetCurrentDate,
  ] = useStore(homeStore, state => [
    state.date,
    state.increaseCurrentDateByOne,
    state.decreaseCurrentDateByOne,
    state.updateCurrentDate,
    state.resetCurrentDate,
  ]);

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
      LOCATION_CITY: s.LOCATION_CITY,
    }),
    shallow,
  );

  const [prayerTimes, setPrayerTimes] = useState<CachedPrayerTimes | undefined>(
    getPrayerTimes(currentDate),
  );

  const [day, setDay] = useState<DayDetails>(getDayDetails(currentDate));

  useEffect(() => {
    setDay(getDayDetails(currentDate));
    setPrayerTimes(getPrayerTimes(currentDate));
  }, [currentDate]);

  useEffect(() => {
    void askPermissions();
  }, []);

  useEffect(() => {
    updateCurrentDate();
  }, [impactfulSettings, updateCurrentDate]);

  return (
    <ScrollView>
      <Stack safeArea flex={1} alignItems="center">
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
              p="2"
              marginLeft="3"
              variant="ghost"
              onPress={() => {
                navigate('QadaCounter');
              }}>
              <AddCircleIcon size="2xl" />
            </Button>
            <Button
              p="2"
              variant="ghost"
              onPress={() => {
                navigate('QiblaFinder');
              }}>
              <ExploreIcon size="2xl" />
            </Button>
            <Button
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
          direction={isRTL ? 'row-reverse' : 'row'}>
          <Button variant="ghost" onPress={decreaseCurrentDateByOne}>
            <Flex direction={isRTL ? 'row' : 'row-reverse'} alignItems="center">
              <Text fontSize="xs" mx="1">{t`Prev Day`}</Text>
              <RestoreIcon size="xl" />
            </Flex>
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
            <Flex direction={isRTL ? 'row' : 'row-reverse'} alignItems="center">
              <UpdateIcon size="xl" />
              <Text mx="1" fontSize="xs">{t`Next Day`}</Text>
            </Flex>
          </Button>
        </HStack>
        <PrayerTimesBox
          pt="2.5"
          prayerTimes={prayerTimes}
          settings={impactfulSettings}
        />
        <Text key={impactfulSettings.SELECTED_ARABIC_CALENDAR} mb="1">
          {day.arabicDate}
        </Text>
        {impactfulSettings.LOCATION_CITY && (
          <Text mb="1">{impactfulSettings.LOCATION_CITY.name}</Text>
        )}
      </Stack>
    </ScrollView>
  );
}
