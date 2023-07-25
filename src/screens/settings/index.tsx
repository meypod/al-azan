import {Stack, FlatList} from 'native-base';
import {memo, useCallback} from 'react';
import SettingsListItem from './settings_list_item';
import {useSettingsMonitor} from './use_settings_monitor';
import {AlarmIcon} from '@/assets/icons/material_icons/alarm';
import {BatteryChargingIcon} from '@/assets/icons/material_icons/battery_charging';
import {BrightnessMediumIcon} from '@/assets/icons/material_icons/brightness_medium';
import {CalculateIcon} from '@/assets/icons/material_icons/calculate';
import {DevModeIcon} from '@/assets/icons/material_icons/dev_mode';
import {ExploreIcon} from '@/assets/icons/material_icons/explore';
import {InfoIcon} from '@/assets/icons/material_icons/info';
import {NotificationsActiveIcon} from '@/assets/icons/material_icons/notifications_active';
import {SaveIcon} from '@/assets/icons/material_icons/save';
import {VolumeUpIcon} from '@/assets/icons/material_icons/volume_up';
import {WidgetIcon} from '@/assets/icons/material_icons/widget';
import {SafeArea} from '@/components/safe_area';
import {RootStackParamList} from '@/navigation/types';

import {settings} from '@/store/settings';

type ScreenListItem = {
  name: keyof RootStackParamList;
  icon: typeof BrightnessMediumIcon;
};

const settingsScreenList: ScreenListItem[] = [
  {
    name: 'BackupSettings',
    icon: SaveIcon,
  },
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
    name: 'FixCommonProblemsSettings',
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
  {
    name: 'AboutSettings',
    icon: InfoIcon,
  },
];

if (settings.getState().DEV_MODE) {
  settingsScreenList.push({
    name: 'DevSettings',
    icon: DevModeIcon,
  });
}

function Settings() {
  useSettingsMonitor();

  const renderItem = useCallback(
    ({item}: {item: ScreenListItem}) => <SettingsListItem item={item} />,
    [],
  );

  return (
    <SafeArea>
      <Stack py="3">
        <FlatList data={settingsScreenList} renderItem={renderItem}></FlatList>
      </Stack>
    </SafeArea>
  );
}

export default memo(Settings);
