import {Box, Button, Flex, HStack, Text} from 'native-base';
import {useEffect, useState} from 'react';
import {getPrayerTimes, PrayerTimesExtended} from '@/adhan';
import {ArrowBackIcon} from '@/assets/icons/arrow_back';
import {ArrowForwardIcon} from '@/assets/icons/arrow_forward';
import {RestoreIcon} from '@/assets/icons/restore';
import {UpdateIcon} from '@/assets/icons/update';
import {AppBar} from '@/components/AppBar';
import {PrayerTimesBox} from '@/components/PrayerTimesBox';
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
  const [scheduledValueOf] = useSettingsHelper('SCHEDULED_ALARM_DATE_VALUE');

  const todayName = getDayName(currentDate);
  const monthName = getMonthName(currentDate);

  useInterval(() => {
    updateCurrentDate();
  }, 60 * 1000);

  useEffect(() => {
    setPrayerTimes(getPrayerTimes(currentDate));
  }, [currentDate, calcSettingsState, scheduledValueOf]);

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
      <HStack justifyContent="space-between" alignItems="center" w="100%">
        <Button variant="ghost" onPress={() => decreaseCurrentDateByOne()}>
          <Flex direction="row" alignItems="center">
            <ArrowBackIcon size="2xl" />
            <RestoreIcon size="xl" />
          </Flex>
        </Button>
        <Button variant="ghost" onPress={() => increaseCurrentDateByOne()}>
          <Flex direction="row" alignItems="center">
            <UpdateIcon size="xl" />
            <ArrowForwardIcon size="2xl" />
          </Flex>
        </Button>
      </HStack>
      <PrayerTimesBox prayerTimes={prayerTimes} />
      <Text>{getArabicDate(currentDate)}</Text>
    </Box>
  );
}
