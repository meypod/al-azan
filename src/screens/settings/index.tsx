import {Box, FlatList, Text, Pressable, HStack} from 'native-base';
import {memo, useEffect} from 'react';

import {AlarmIcon} from '@/assets/icons/alarm';
import {BatteryChargingIcon} from '@/assets/icons/battery_charging';
import {BrightnessMediumIcon} from '@/assets/icons/brightness_medium';
import {CalculateIcon} from '@/assets/icons/calculate';
import {ExploreIcon} from '@/assets/icons/explore';
import {NotificationsActiveIcon} from '@/assets/icons/notifications_active';
import {VolumeUpIcon} from '@/assets/icons/volume_up';
import {WidgetIcon} from '@/assets/icons/widget';
import {push} from '@/navigation/root_navigation';
import {RootStackParamList, translateRoute} from '@/navigation/types';
import {useCalcSettings} from '@/store/calculation_settings';
import {setNextAdhan} from '@/tasks/set_next_adhan';
import {updateWidgets} from '@/tasks/update_widgets';

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
  {
    name: 'WidgetSettings',
    icon: WidgetIcon,
  },
  {
    name: 'RemindersSettings',
    icon: AlarmIcon,
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
            alignItems="center">
            <item.icon size="4xl" mx="2"></item.icon>
            <Text>{translateRoute(item.name)}</Text>
          </HStack>
        );
      }}
    </Pressable>
  );
}

function Settings() {
  const settingsState = useCalcSettings(state => state);
  useEffect(() => {
    setNextAdhan();
    updateWidgets();
  }, [settingsState]);

  return (
    <Box safeArea py="3">
      <FlatList data={settingsScreenList} renderItem={renderItem}></FlatList>
    </Box>
  );
}

export default memo(Settings);
