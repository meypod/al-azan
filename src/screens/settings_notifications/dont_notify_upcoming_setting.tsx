import {t} from '@lingui/macro';
import {HStack, FormControl, IStackProps, Switch, Text} from 'native-base';
import {useCallback} from 'react';
import {useAlarmSettings} from '@/store/alarm';

export function DontNotifyUpcomingSetting(props: IStackProps) {
  const [dontNotifyUpcomingAlarm, setDontNotifyUpcomingAlarm] =
    useAlarmSettings('DONT_NOTIFY_UPCOMING');

  const onToggle = useCallback(
    (value: boolean) => {
      setDontNotifyUpcomingAlarm(!value);
    },
    [setDontNotifyUpcomingAlarm],
  );

  return (
    <HStack {...props}>
      <FormControl fontSize="md">
        <HStack justifyContent={'space-between'}>
          <Text flexShrink={1}>{t`Show upcoming alarm notification?`}</Text>
          <Switch
            value={!dontNotifyUpcomingAlarm}
            onToggle={onToggle}
            size="lg"
          />
        </HStack>
        <FormControl.HelperText mt="-1">
          {t`if enabled, a notification will be shown around one hour before any prayer time or reminder that has sound`}
        </FormControl.HelperText>
      </FormControl>
    </HStack>
  );
}
