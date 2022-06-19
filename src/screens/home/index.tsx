import {t} from '@lingui/macro';
import {Box, Button, Flex, HStack, Text} from 'native-base';
import {useEffect, useState} from 'react';
import {getPrayerTimes, PrayerTimesExtended} from '@/adhan';
import {RestoreIcon} from '@/assets/icons/restore';
import {UpdateIcon} from '@/assets/icons/update';
import {AppBar} from '@/components/AppBar';
import PrayerTimesBox from '@/components/PrayerTimesBox';
import {isRTL} from '@/i18n';
import {useCalcSettings} from '@/store/calculation_settings';
import {useStore} from '@/store/home';
import {useSettingsHelper} from '@/store/settings';
import {getArabicDate, getDay, getDayName, getMonthName} from '@/utils/date';
import useInterval from '@/utils/hooks/use_interval';

export function Home() {
  const [
    currentDate,
    increaseCurrentDateByOne,
    decreaseCurrentDateByOne,
    updateCurrentDate,
  ] = useStore(state => [
    state.date,
    state.increaseCurrentDateByOne,
    state.decreaseCurrentDateByOne,
    state.updateCurrentDate,
  ]);
  const [prayerTimes, setPrayerTimes] = useState<
    PrayerTimesExtended | undefined
  >(undefined);

  const calcSettingsState = useCalcSettings(state => state);
  const [scheduledValueOf] = useSettingsHelper('SCHEDULED_ALARM_TIMESTAMP');
  const [hiddenPrayers] = useSettingsHelper('HIDDEN_PRAYERS');

  const todayName = getDayName(currentDate);
  const monthName = getMonthName(currentDate);

  useInterval(() => {
    updateCurrentDate();
  }, 60 * 1000);

  useEffect(() => {
    updateCurrentDate();
  }, [scheduledValueOf, updateCurrentDate]);

  useEffect(() => {
    setPrayerTimes(getPrayerTimes(currentDate));
  }, [currentDate, calcSettingsState]);

  return (
    <Box
      safeArea
      flex={1}
      alignItems="center"
      onTouchStart={() => updateCurrentDate()}>
      <AppBar
        dayName={todayName}
        monthName={monthName}
        dd={getDay(currentDate)}
      />
      <HStack
        justifyContent="space-between"
        alignItems="center"
        w="100%"
        direction={isRTL ? 'row-reverse' : 'row'}>
        <Button variant="ghost" onPress={() => decreaseCurrentDateByOne()}>
          <Flex direction={isRTL ? 'row' : 'row-reverse'} alignItems="center">
            <Text fontSize="xs" mx="1">{t`Prev Day`}</Text>
            <RestoreIcon size="xl" />
          </Flex>
        </Button>
        <Button variant="ghost" onPress={() => increaseCurrentDateByOne()}>
          <Flex direction={isRTL ? 'row' : 'row-reverse'} alignItems="center">
            <UpdateIcon size="xl" />
            <Text mx="1" fontSize="xs">{t`Next Day`}</Text>
          </Flex>
        </Button>
      </HStack>
      <PrayerTimesBox prayerTimes={prayerTimes} hiddenPrayers={hiddenPrayers} />
      <Text>{getArabicDate(currentDate)}</Text>
    </Box>
  );
}
