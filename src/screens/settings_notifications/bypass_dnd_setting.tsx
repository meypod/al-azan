import {t} from '@lingui/macro';
import {HStack, FormControl, IStackProps, Switch, Text} from 'native-base';
import {useCallback} from 'react';
import {useSettings} from '@/store/settings';
import {useNoInitialEffect} from '@/utils/hooks/use_no_initial_effect';
import {askPermissions} from '@/utils/permission';

export function BypassDnDSetting(props: IStackProps) {
  const [bypassDND, setBypassDND] = useSettings('BYPASS_DND');

  const onToggle = useCallback(
    (value: boolean) => {
      setBypassDND(value);
    },
    [setBypassDND],
  );

  useNoInitialEffect(() => {
    askPermissions();
  }, [bypassDND]);

  return (
    <HStack {...props}>
      <FormControl fontSize="md">
        <HStack justifyContent={'space-between'}>
          <Text flexShrink={1}>{t`Bypass "Do Not Disturb"?`}</Text>
          <Switch value={bypassDND} onToggle={onToggle} size="lg" />
        </HStack>
        <FormControl.HelperText>
          {t`Should app still play adhan when "Do Not Disturb" is active?`}
        </FormControl.HelperText>
      </FormControl>
    </HStack>
  );
}
