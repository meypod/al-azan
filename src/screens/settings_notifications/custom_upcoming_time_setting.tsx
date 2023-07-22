import {t} from '@lingui/macro';
import {HStack, FormControl, IStackProps, Text, Select} from 'native-base';
import {useCallback, useMemo} from 'react';
import {useAlarmSettings} from '@/store/alarm';

export function CustomUpcomingTimeSetting(props: IStackProps) {
  const [upcomingTime, setUpcomingTime] = useAlarmSettings(
    'PRE_ALARM_MINUTES_BEFORE',
  );

  const upcomingTimeString = useMemo(
    () => upcomingTime.toString(),
    [upcomingTime],
  );

  const setUpcomingTimeProxy = useCallback(
    (numStr: string) => {
      setUpcomingTime(parseInt(numStr, 10) || 60);
    },
    [setUpcomingTime],
  );

  return (
    <HStack {...props}>
      <FormControl fontSize="md">
        <Text>{t`Custom upcoming alarm time`}</Text>
        <Select
          borderRadius={0}
          borderTopLeftRadius={'sm'}
          flex={1}
          selectedValue={upcomingTimeString}
          onValueChange={setUpcomingTimeProxy}>
          <Select.Item label={t`5 min`} value="5" />
          <Select.Item label={t`10 min`} value="10" />
          <Select.Item label={t`15 min`} value="15" />
          <Select.Item label={t`30 min`} value="30" />
          <Select.Item label={t`60 min`} value="60" />
          <Select.Item label={t`90 min`} value="90" />
        </Select>
        <FormControl.HelperText>
          {t`You can change when the upcoming alarm notification is sent before adhan or reminder`}
        </FormControl.HelperText>
      </FormControl>
    </HStack>
  );
}
