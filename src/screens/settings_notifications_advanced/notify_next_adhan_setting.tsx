import {t} from '@lingui/macro';
import {HStack, FormControl, IStackProps, Switch, Text} from 'native-base';
import {useAlarmSettings} from '@/store/alarm';

export function NotifyNextAdhanSetting(props: IStackProps) {
  const [notifyNextPrayerTime, setNotifyNextPrayerTime] = useAlarmSettings(
    'SHOW_NEXT_PRAYER_TIME',
  );

  return (
    <HStack {...props}>
      <FormControl fontSize="md">
        <HStack justifyContent={'space-between'}>
          <Text flexShrink={1}>{t`Show next in notification?`}</Text>
          <Switch
            value={notifyNextPrayerTime}
            onToggle={setNotifyNextPrayerTime}
            size="lg"
          />
        </HStack>
        <FormControl.HelperText mt="-1">
          {t`If enabled, when a notification is shown, it will contain info for the next prayer time`}
        </FormControl.HelperText>
      </FormControl>
    </HStack>
  );
}
