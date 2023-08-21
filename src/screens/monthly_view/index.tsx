import {t} from '@lingui/macro';
import {
  Button,
  FlatList,
  HStack,
  Stack,
  Text,
  Divider as SolidDivider,
} from 'native-base';
import {PropsWithChildren, memo, useCallback, useMemo} from 'react';
import {ListRenderItemInfo} from 'react-native';
import {useStore} from 'zustand';
import {shallow} from 'zustand/shallow';
import {
  Prayer,
  calculatePrayerTimes,
  isMinimumSettingsAvailable,
  translatePrayer,
} from '@/adhan';
import {RestoreIcon} from '@/assets/icons/material_icons/restore';
import {UpdateIcon} from '@/assets/icons/material_icons/update';
import {SafeArea} from '@/components/safe_area';
import {isRTL} from '@/i18n';
import {CachedPrayerTimes} from '@/store/adhan_calc_cache';
import {calcSettings} from '@/store/calculation';
import {monthlyViewStore} from '@/store/monthly_view';
import {useSettings} from '@/store/settings';
import {
  getTime,
  getMonthDates,
  getYearAndMonth,
  getDayNumeric,
  isDateToday,
} from '@/utils/date';

type MonthDetails = {
  yearAndMonth: string;
};

function getMonthDetails(date: Date, hijri: boolean): MonthDetails {
  return {
    yearAndMonth: getYearAndMonth(date, hijri),
  };
}

const TableCell = memo(function TableCell({
  children,
  highlighted,
  flex = 2,
}: PropsWithChildren & {flex?: number; highlighted?: boolean}) {
  return (
    <Text
      flex={flex}
      flexShrink={0}
      noOfLines={1}
      pr="3"
      textAlign="left"
      fontSize="xs"
      color={highlighted ? 'green.600' : 'darkText'}
      _dark={{color: highlighted ? 'green.400' : 'light.50'}}>
      {children}
    </Text>
  );
});

export function MonthlyView() {
  const {
    currentDate,
    isNotThisMonth,
    increaseCurrentDateByOneMonth,
    decreaseCurrentDateByOneMonth,
    resetCurrentDate,
  } = useStore(
    monthlyViewStore,
    state => ({
      currentDate: state.date,
      isNotThisMonth: state.isNotThisMonth,
      increaseCurrentDateByOneMonth: state.increaseCurrentDateByOneMonth,
      decreaseCurrentDateByOneMonth: state.decreaseCurrentDateByOneMonth,
      resetCurrentDate: state.resetCurrentDate,
    }),
    shallow,
  );

  const canSeeTimes = useMemo(
    () => isMinimumSettingsAvailable(calcSettings.getState()),
    [],
  );

  const [isHijriView, setHijri] = useSettings('HIJRI_MONTHLY_VIEW');
  const toggleHijri = useCallback(() => {
    setHijri(!isHijriView);
  }, [isHijriView, setHijri]);

  const monthPrayerTimes = useMemo(
    () =>
      (canSeeTimes
        ? getMonthDates(currentDate, isHijriView)
            .map(calculatePrayerTimes)
            .filter(Boolean)
        : []) as CachedPrayerTimes[],
    [currentDate, isHijriView, canSeeTimes],
  );

  const month = useMemo(
    () => getMonthDetails(currentDate, isHijriView),
    [currentDate, isHijriView],
  );

  const renderItem = useCallback(
    ({item}: ListRenderItemInfo<CachedPrayerTimes>) => {
      const highlighted = isDateToday(item.date, isHijriView);
      const bw = highlighted ? 0.5 : 0;
      return (
        <HStack
          p="1"
          pl="2"
          borderTopWidth={bw}
          borderBottomWidth={bw}
          borderColor="coolGray.400">
          <TableCell flex={1} highlighted={highlighted}>
            {getDayNumeric(item.date, isHijriView)}
          </TableCell>
          <TableCell highlighted={highlighted}>{getTime(item.fajr)}</TableCell>
          <TableCell highlighted={highlighted}>{getTime(item.dhuhr)}</TableCell>
          <TableCell highlighted={highlighted}>{getTime(item.asr)}</TableCell>
          <TableCell highlighted={highlighted}>
            {getTime(item.maghrib)}
          </TableCell>
          <TableCell highlighted={highlighted}>{getTime(item.isha)}</TableCell>
        </HStack>
      );
    },
    [isHijriView],
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 10, // height of each row
      offset: index * 10, // height of rows till curr index
      index,
    }),
    [],
  );

  const keyExtractor = useCallback(
    (item: CachedPrayerTimes) => item.date.toString(),
    [],
  );

  return (
    <SafeArea>
      <Stack flex={1} alignItems="stretch">
        <Button
          py="0.5"
          mb="0.5"
          mt="0.5"
          mx="1"
          variant="outline"
          onPress={toggleHijri}>
          {month.yearAndMonth}
        </Button>
        <HStack
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          w="100%"
          flexDirection={isRTL ? 'row-reverse' : 'row'}>
          <Button variant="ghost" onPress={decreaseCurrentDateByOneMonth}>
            <Stack
              flexDirection={isRTL ? 'row' : 'row-reverse'}
              alignItems="center">
              <Text fontSize="xs" mx="1">{t`Prev Month`}</Text>
              <RestoreIcon size="lg" />
            </Stack>
          </Button>
          {isNotThisMonth && (
            <Button
              onPress={resetCurrentDate}
              variant="outline"
              py="2"
              px="1"
              flexShrink={1}
              _text={{
                adjustsFontSizeToFit: true,
                minimumFontScale: 0.8,
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
              {t`Show current`}
            </Button>
          )}
          <Button variant="ghost" onPress={increaseCurrentDateByOneMonth}>
            <Stack
              flexDirection={isRTL ? 'row' : 'row-reverse'}
              alignItems="center">
              <UpdateIcon size="lg" />
              <Text mx="1" fontSize="xs">{t`Next Month`}</Text>
            </Stack>
          </Button>
        </HStack>
        <SolidDivider borderColor="coolGray.300" mb="2"></SolidDivider>
        <FlatList
          flex={1}
          ListHeaderComponent={listHeaderComponent}
          data={monthPrayerTimes}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          keyExtractor={keyExtractor}
          ListEmptyComponent={listEmptyComponent}></FlatList>
      </Stack>
    </SafeArea>
  );
}

const listHeaderComponent = memo(function listHeaderComponent() {
  return (
    <HStack p="1" pl="2">
      <TableCell flex={1}>{t`Date`}</TableCell>
      <TableCell>{translatePrayer(Prayer.Fajr)}</TableCell>
      <TableCell>{translatePrayer(Prayer.Dhuhr)}</TableCell>
      <TableCell>{translatePrayer(Prayer.Asr)}</TableCell>
      <TableCell>{translatePrayer(Prayer.Maghrib)}</TableCell>
      <TableCell>{translatePrayer(Prayer.Isha)}</TableCell>
    </HStack>
  );
});

const listEmptyComponent = memo(function listEmptyComponent() {
  return (
    <Text
      flex={1}
      textAlign="center"
      p="3"
      color="muted.500">{t`Required settings are incomplete. For app to show prayer times, You have to configure it from settings later.`}</Text>
  );
});
