import {t} from '@lingui/macro';
import {HStack, FormControl, IStackProps, Select} from 'native-base';
import {useCallback} from 'react';
import {VibrationMode} from '@/modules/activity';
import {useAlarmSettings} from '@/store/alarm';

export function VibrationSetting(props: IStackProps) {
  const [vibrationMode, setVibrationMode] = useAlarmSettings('VIBRATION_MODE');

  const setVibrationModeProxy = useCallback(
    (val: string) => {
      setVibrationMode(parseInt(val, 10) || 0);
    },
    [setVibrationMode],
  );
  return (
    <HStack {...props}>
      <FormControl fontSize="md">
        <FormControl.Label>{t`Vibration Mode`}</FormControl.Label>
        <FormControl.HelperText>
          {t`Should phone vibrate when adhan or reminder starts playing?`}
        </FormControl.HelperText>
        <Select
          selectedValue={(vibrationMode || 0).toString()}
          accessibilityLabel={t`Choose Calculation Method`}
          onValueChange={setVibrationModeProxy}>
          <Select.Item label={t`Off`} value={VibrationMode.OFF.toString()} />
          <Select.Item label={t`Once`} value={VibrationMode.ONCE.toString()} />
          <Select.Item
            label={t`Continuous`}
            value={VibrationMode.CONTINUOUS.toString()}
          />
        </Select>
      </FormControl>
    </HStack>
  );
}
