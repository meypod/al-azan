import {t} from '@lingui/macro';
import {HStack, FormControl, IStackProps, Switch, Text} from 'native-base';
import {useSettings} from '@/store/settings';

export function DontTurnOnScreenSetting(props: IStackProps) {
  const [dontTurnOn, setDontTurnOn] = useSettings('DONT_TURN_ON_SCREEN');

  return (
    <HStack {...props}>
      <FormControl fontSize="md">
        <HStack justifyContent={'space-between'}>
          <Text flexShrink={1}>{t`Don't show alarm screen?`}</Text>
          <Switch value={dontTurnOn} onToggle={setDontTurnOn} size="lg" />
        </HStack>
        <FormControl.HelperText>
          {t`When enabled, the screen will remain off when adhan or reminder starts playing, and alarm screen won't be shown`}
        </FormControl.HelperText>
      </FormControl>
    </HStack>
  );
}
