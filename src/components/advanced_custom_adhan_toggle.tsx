import {t} from '@lingui/macro';
import {Button, IButtonProps} from 'native-base';
import {useCallback} from 'react';
import {useSettings} from '@/store/settings';

export function AdvancedCustomAdhanToggle(props: IButtonProps) {
  const [value, setValue] = useSettings('ADVANCED_CUSTOM_ADHAN');

  const valueToggle = useCallback(() => {
    setValue(!value);
  }, [value, setValue]);

  return (
    <Button
      {...props}
      alignItems="center"
      justifyContent="center"
      onPress={valueToggle}
      variant="outline"
      borderColor={value ? 'primary.600' : 'muted.400'}
      _text={{
        color: value ? 'primary.600' : 'dark.200',
        _dark: {
          color: value ? 'primary.400' : 'light.300',
        },
      }}
      _dark={{
        borderColor: value ? 'primary.400' : 'muted.400',
      }}
      p="1">
      {t`Advanced`}
    </Button>
  );
}
