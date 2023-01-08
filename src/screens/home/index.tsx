import {t} from '@lingui/macro';
import {Box, Button, Flex, HStack, ScrollView, Text} from 'native-base';
import {useEffect, useState} from 'react';
import {getPrayerTimes, PrayerTimesHelper} from '@/adhan';
import {RestoreIcon} from '@/assets/icons/restore';
import {SettingsSharpIcon} from '@/assets/icons/settings_sharp';
import {UpdateIcon} from '@/assets/icons/update';
import Divider from '@/components/Divider';
import PrayerTimesBox from '@/components/PrayerTimesBox';
import {isRTL} from '@/i18n';
import {navigate} from '@/navigation/root_navigation';
import {useCalcSettings} from '@/store/calculation';
import {useStore} from '@/store/home';
import {useSettingsHelper} from '@/store/settings';
import {getArabicDate, getDayName, getFormattedDate} from '@/utils/date';
import useInterval from '@/utils/hooks/use_interval';

export function Home() {
  const [
    currentDate,
    increaseCurrentDateByOne,
    decreaseCurrentDateByOne,
    updateCurrentDate,
    resetCurrentDate,
  ] = useStore(state => [
    state.date,
    state.increaseCurrentDateByOne,
    state.decreaseCurrentDateByOne,
    state.updateCurrentDate,
    state.resetCurrentDate,
  ]);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesHelper | undefined>(
    undefined,
  );

  const [isToday, setIsToday] = useState<boolean>();

  const calcSettingsState = useCalcSettings(state => state);
  const [hiddenPrayers] = useSettingsHelper('HIDDEN_PRAYERS');
  const [numberingSystem] = useSettingsHelper('NUMBERING_SYSTEM');
  const [arabicCalendar] = useSettingsHelper('SELECTED_ARABIC_CALENDAR');
  const [secondaryCalendar] = useSettingsHelper('SELECTED_SECONDARY_CALENDAR');

  const [today, setToday] = useState<{
    dateString: string;
    todayName: string;
    arabicDate: string;
  }>({dateString: '', todayName: '', arabicDate: ''});

  useEffect(() => {
    setToday({
      todayName: getDayName(currentDate),
      dateString: getFormattedDate(currentDate),
      arabicDate: getArabicDate(currentDate),
    });
  }, [currentDate, numberingSystem, secondaryCalendar]);

  useInterval(() => {
    updateCurrentDate();
  }, 60 * 1000);

  useEffect(() => {
    setPrayerTimes(getPrayerTimes(currentDate));
    setIsToday(currentDate.toDateString() === new Date().toDateString());
  }, [currentDate, calcSettingsState]);

  return (
    <ScrollView>
      <Box
        safeArea
        flex={1}
        alignItems="center"
        onTouchStart={updateCurrentDate}>
        <HStack
          mb="-3"
          px="3"
          justifyContent="space-between"
          alignItems="center"
          w="100%">
          <HStack alignItems="center">
            <Text>{today.dateString}</Text>
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
          {today.todayName}
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
          {!isToday && (
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
          hiddenPrayers={hiddenPrayers}
          date={currentDate}
        />
        <Text key={arabicCalendar} mb="3">
          {today.arabicDate}
        </Text>
      </Box>
    </ScrollView>
  );
}
