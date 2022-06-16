import {i18n} from '@lingui/core';
import {Box, FlatList, Text, Pressable, HStack} from 'native-base';
import {useEffect} from 'react';

import {BatteryChargingIcon} from '@/assets/icons/battery_charging';
import {BrightnessMediumIcon} from '@/assets/icons/brightness_medium';
import {CalculateIcon} from '@/assets/icons/calculate';
import {ExploreIcon} from '@/assets/icons/explore';
import {NotificationsActiveIcon} from '@/assets/icons/notifications_active';
import {VolumeUpIcon} from '@/assets/icons/volume_up';
import {isRTL} from '@/i18n';
import {push} from '@/navigation/root_navigation';
import {routeTranslations, RootStackParamList} from '@/navigation/types';
import {useSettings} from '@/store/settings';
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
    icon: NotificationsActiveIcon,
  },
  {
    name: 'AdhanSettings',
    icon: VolumeUpIcon,
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
    <Pressable onPress={() => push(item.name)}>
      {({isPressed}) => {
        return (
          <HStack
            backgroundColor={isPressed ? 'coolGray.300:alpha.20' : undefined}
            py="3"
            flexDir={isRTL ? 'row-reverse' : 'row'}
            alignItems="center">
            <item.icon size="4xl" mx="2"></item.icon>
            <Text>{i18n._(routeTranslations[item.name])}</Text>
          </HStack>
        );
      }}
    </Pressable>
  );
}

export function Settings() {
  const settingsState = useSettings(state => state);
  useEffect(() => {
    setNextAdhan();
  }, [settingsState]);

  return (
    <Box safeArea py="3">
      <FlatList data={settingsScreenList} renderItem={renderItem}></FlatList>
    </Box>
  );
}
