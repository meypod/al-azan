import {t} from '@lingui/macro';
import {Box, Button, Flex, HStack, ScrollView, Text} from 'native-base';
import {useEffect, useState} from 'react';
import {useStore} from 'zustand';
import {shallow} from 'zustand/shallow';
import {getPrayerTimes, PrayerTimesHelper} from '@/adhan';
import {RestoreIcon} from '@/assets/icons/restore';
import {SettingsSharpIcon} from '@/assets/icons/settings_sharp';
import {UpdateIcon} from '@/assets/icons/update';
import Divider from '@/components/Divider';
import PrayerTimesBox from '@/components/PrayerTimesBox';
import {isRTL} from '@/i18n';

import {navigate} from '@/navigation/root_navigation';

import {homeStore} from '@/store/home';
import {settings} from '@/store/settings';

import {getArabicDate, getDayName, getFormattedDate} from '@/utils/date';
import {askPermissions} from '@/utils/permission';

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
    }),
    shallow,
  );

  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesHelper | undefined>(
    undefined,
  );

  const [day, setDay] = useState<{
    dateString: string;
    dayName: string;
    arabicDate: string;
    isToday: boolean;
  }>({dateString: '', dayName: '', arabicDate: '', isToday: true});

  useEffect(() => {
    setDay({
      dayName: getDayName(currentDate),
      dateString: getFormattedDate(currentDate),
      arabicDate: getArabicDate(currentDate),
      isToday: currentDate.toDateString() === new Date().toDateString(),
    });
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
      <Box safeArea flex={1} alignItems="center">
        <HStack
          mb="-3"
          px="3"
          justifyContent="space-between"
          alignItems="center"
          w="100%">
          <HStack alignItems="center">
            <Text>{day.dateString}</Text>
          </HStack>

          <Button
            marginRight="-3"
            variant="ghost"
            onPress={() => {
              navigate('Settings');
            }}>
            <SettingsSharpIcon size="2xl" />
          </Button>
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
          prayerTimes={prayerTimes}
          date={currentDate}
          settings={impactfulSettings}
        />
        <Text key={impactfulSettings.SELECTED_ARABIC_CALENDAR} mb="3">
          {day.arabicDate}
        </Text>
      </Box>
    </ScrollView>
  );
}
