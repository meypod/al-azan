import {t} from '@lingui/macro';
import {HStack, FormControl, IStackProps, Switch, Text} from 'native-base';
import {useCallback} from 'react';
import {useSettings} from '@/store/settings';

export function PreferHeadphoneSetting(props: IStackProps) {
  const [preference, setPreference] = useSettings(
    'PREFER_EXTERNAL_AUDIO_DEVICE',
  );

  const onToggle = useCallback(
    (value: boolean) => {
      setPreference(value);
    },
    [setPreference],
  );

  return (
    <HStack {...props}>
      <FormControl fontSize="md">
        <HStack justifyContent={'space-between'}>
          <Text flexShrink={1}>{t`Use headphones when available?`}</Text>
          <Switch value={preference} onToggle={onToggle} size="lg" />
        </HStack>
        <FormControl.HelperText mt="-1">
          {t`When enabled, when using headphones, all audio will play only on headphones.`}
        </FormControl.HelperText>
      </FormControl>
    </HStack>
  );
}
