import {t} from '@lingui/macro';
import {IButtonProps} from 'native-base';
import {useCallback} from 'react';
import {ToggleButton} from './ToggleButton';
import {useSettings} from '@/store/settings';

export function AdvancedCustomAdhanToggle(props: IButtonProps) {
  const [value, setValue] = useSettings('ADVANCED_CUSTOM_ADHAN');

  const valueToggle = useCallback(() => {
    setValue(!value);
  }, [value, setValue]);

  return (
    <ToggleButton {...props} onPress={valueToggle} active={value} p="1">
      {t`Advanced`}
    </ToggleButton>
  );
}
