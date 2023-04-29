import {t} from '@lingui/macro';
import {FormControl, Text, Switch, HStack} from 'native-base';
import {memo} from 'react';
import {useSettings} from '@/store/settings';

const AdaptiveChargingToggleView = memo(function AdaptiveChargingToggleView({
  onToggle,
  value,
}: {
  value: boolean;
  onToggle: (newVal: boolean) => void;
}) {
  return (
    <FormControl display="flex" pb="4">
      <FormControl.Label>{t`Adaptive Charging`}</FormControl.Label>
      <FormControl.HelperText mb="2">
        <Text
          textAlign="justify"
          fontSize="xs">{t`If your device has adaptive charging, like Google Pixel, and you don't want adhan or reminders to be recognized as an alarm, you can enable this option.`}</Text>
        <Text
          textAlign="justify"
          fontSize="xs">{t`Please note that enabling this option may cause adhan and reminders to fire with a delay or not at all in some cases. Enable this with caution.`}</Text>
      </FormControl.HelperText>

      <HStack justifyContent={'space-between'}>
        <Text flexShrink={1}>{t`Use a different alarm type?`}</Text>
        <Switch value={value} onToggle={onToggle} size="lg" />
      </HStack>
    </FormControl>
  );
});

export function AdaptiveChargingToggle() {
  const [differentAlarm, setDifferentAlarm] = useSettings(
    'USE_DIFFERENT_ALARM_TYPE',
  );

  return (
    <AdaptiveChargingToggleView
      onToggle={setDifferentAlarm}
      value={differentAlarm}
    />
  );
}
