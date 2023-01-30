import {Box, FlatList, Text, Pressable, HStack} from 'native-base';
import {memo, useEffect} from 'react';
import {useStore} from 'zustand';
import {AlarmIcon} from '@/assets/icons/alarm';
import {BatteryChargingIcon} from '@/assets/icons/battery_charging';
import {BrightnessMediumIcon} from '@/assets/icons/brightness_medium';
import {CalculateIcon} from '@/assets/icons/calculate';
import {ExploreIcon} from '@/assets/icons/explore';
import {InfoIcon} from '@/assets/icons/info';
import {NotificationsActiveIcon} from '@/assets/icons/notifications_active';
import {VolumeUpIcon} from '@/assets/icons/volume_up';
import {WidgetIcon} from '@/assets/icons/widget';
import {push} from '@/navigation/root_navigation';
import {RootStackParamList, translateRoute} from '@/navigation/types';
import {clearCache} from '@/store/adhan_calc_cache';
import {alarmSettings} from '@/store/alarm';
import {calcSettings} from '@/store/calculation';
import {reminderSettings} from '@/store/reminder';
import {settings, useSettings} from '@/store/settings';
import {setNextAdhan} from '@/tasks/set_next_adhan';
import {setReminders} from '@/tasks/set_reminder';
import {updateWidgets} from '@/tasks/update_widgets';
import {sha256} from '@/utils/hash';
import useNoInitialEffect from '@/utils/hooks/use_update_effect';
import {askPermissions} from '@/utils/permission';

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
  {
    name: 'AboutSettings',
    icon: InfoIcon,
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
  const calcSettingsState = useStore(calcSettings, state => state);
  const alarmSettingsState = useStore(alarmSettings, state => state);
  const reminderSettingsState = useStore(reminderSettings, state => state);
  const [calcSettingsHash, setCalcSettingsHash] =
    useSettings('CALC_SETTINGS_HASH');
  const [alarmSettingsHash, setAlarmSettingsHash] = useSettings(
    'ALARM_SETTINGS_HASH',
  );
  const [reminderSettingsHash, setReminderSettingsHash] = useSettings(
    'REMINDER_SETTINGS_HASH',
  );

  useEffect(() => {
    const stateHash = sha256(JSON.stringify(calcSettingsState));
    if (calcSettingsHash !== stateHash) {
      setCalcSettingsHash(stateHash);
      settings.setState({DELIVERED_ALARM_TIMESTAMPS: {}});
      clearCache();
    }
  }, [calcSettingsState, calcSettingsHash, setCalcSettingsHash]);

  useEffect(() => {
    const stateHash = sha256(JSON.stringify(alarmSettingsState));
    if (alarmSettingsHash !== stateHash) {
      askPermissions().then(() => {
        setAlarmSettingsHash(stateHash);
        settings.setState({DELIVERED_ALARM_TIMESTAMPS: {}});
      });
    }
  }, [alarmSettingsState, alarmSettingsHash, setAlarmSettingsHash]);

  useEffect(() => {
    const stateHash = sha256(JSON.stringify(reminderSettingsState));
    if (reminderSettingsHash !== stateHash) {
      setReminderSettingsHash(stateHash);
    }
  }, [reminderSettingsHash, reminderSettingsState, setReminderSettingsHash]);

  useEffect(() => {
    updateWidgets();
    setNextAdhan();
  }, [calcSettingsHash, alarmSettingsHash]);

  useNoInitialEffect(() => {
    setReminders({noToast: true, force: true});
  }, [calcSettingsHash]);

  return (
    <Box safeArea py="3">
      <FlatList data={settingsScreenList} renderItem={renderItem}></FlatList>
    </Box>
  );
}

export default memo(Settings);
