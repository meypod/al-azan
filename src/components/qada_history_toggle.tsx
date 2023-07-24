import {t} from '@lingui/macro';
import {Button, HStack, IButtonProps, IIconProps} from 'native-base';
import {useCallback} from 'react';
import {ScheduleIcon} from '@/assets/icons/material_icons/schedule';
import {useSettings} from '@/store/settings';

export function QadaHistoryToggle(props: IButtonProps & IIconProps) {
  const {size, ...otherProps} = props;
  const [historyVisible, setHistoryVisible] = useSettings(
    'COUNTER_HISTORY_VISIBLE',
  );

  const historyVisibilityToggle = useCallback(() => {
    setHistoryVisible(!historyVisible);
  }, [historyVisible, setHistoryVisible]);

  return (
    <Button
      {...otherProps}
      onPress={historyVisibilityToggle}
      variant="outline"
      borderColor={historyVisible ? 'primary.600' : 'muted.400'}
      _dark={{
        borderColor: historyVisible ? 'primary.400' : 'muted.400',
      }}
      accessibilityLabel={
        historyVisible ? t`Turn history off` : t`Turn history on`
      }
      p="1">
      <HStack alignItems="center">
        <ScheduleIcon
          size={size}
          color={historyVisible ? 'primary.600' : 'dark.200'}
          _dark={{
            color: historyVisible ? 'primary.400' : 'light.300',
          }}
        />
      </HStack>
    </Button>
  );
}
