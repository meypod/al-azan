import {t} from '@lingui/macro';
import {HStack, FormControl, IStackProps, Switch, Text} from 'native-base';
import {useCallback} from 'react';
import {useSettings} from '@/store/settings';

export function VolumeButtonSetting(props: IStackProps) {
  const [volumeButtonStopsAdhan, setVolumeButtonStopsAdhan] = useSettings(
    'VOLUME_BUTTON_STOPS_ADHAN',
  );

  const onToggle = useCallback(
    (value: boolean) => {
      setVolumeButtonStopsAdhan(value);
    },
    [setVolumeButtonStopsAdhan],
  );

  return (
    <HStack {...props}>
      <FormControl fontSize="md">
        <HStack justifyContent={'space-between'}>
          <Text flexShrink={1}>{t`Volume button stops adhan`}</Text>
          <Switch
            value={volumeButtonStopsAdhan}
            onToggle={onToggle}
            size="lg"
          />
        </HStack>
        <FormControl.HelperText>
          {t`Should app stop playing adhan when the volume button is pressed?`}
        </FormControl.HelperText>
      </FormControl>
    </HStack>
  );
}
