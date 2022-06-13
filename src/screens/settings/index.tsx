import {i18n} from '@lingui/core';
import {Box, FlatList, Text, Pressable, HStack} from 'native-base';
import {useEffect} from 'react';

import {BatteryChargingIcon} from '@/assets/icons/battery_charging';
import {BrightnessMediumIcon} from '@/assets/icons/brightness_medium';
import {CalculateIcon} from '@/assets/icons/calculate';
import {ExploreIcon} from '@/assets/icons/explore';
import {NotificationsIcon} from '@/assets/icons/notifications';
import {isRTL} from '@/i18n';
import {push} from '@/navigation/root_navigation';
import {routeTranslations, RootStackParamList} from '@/navigation/types';
import {useStore as useSettingStore} from '@/store/settings';
import {setNextAdhan} from '@/tasks/set_next_adhan';

type ScreenListItem = {
  name: keyof RootStackParamList;
  icon: typeof BrightnessMediumIcon;
};

const settingsScreenList: ScreenListItem[] = [
  {
    name: 'DisplaySettings',
    icon: BrightnessMediumIcon,
  },
  {
    name: 'LocationSettings',
    icon: ExploreIcon,
  },
  {
    name: 'NotificationSettings',
    icon: NotificationsIcon,
  },
  {
    name: 'CalculationSettings',
    icon: CalculateIcon,
  },
  {
    name: 'BatteryOptimizationSettings',
    icon: BatteryChargingIcon,
  },
];

function renderItem({item}: {item: ScreenListItem}) {
  return (
    <Pressable mb="3" onPress={() => push(item.name)}>
      <HStack
        py="3"
        backgroundColor="coolGray.300:alpha.20"
        borderColor="coolGray.300:alpha.40"
        borderWidth={1}
        borderRadius={6}
        flexDir={isRTL ? 'row-reverse' : 'row'}
        alignItems="center">
        <item.icon size="4xl" mx="2"></item.icon>
        <Text>{i18n._(routeTranslations[item.name])}</Text>
      </HStack>
    </Pressable>
  );
}

export function Settings() {
  const settingsState = useSettingStore(state => state);
  useEffect(() => {
    setNextAdhan();
  }, [settingsState]);

  return (
    <Box safeArea p="3">
      <FlatList data={settingsScreenList} renderItem={renderItem}></FlatList>
    </Box>
  );
}
