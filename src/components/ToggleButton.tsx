import {Button, IButtonProps} from 'native-base';
import {memo} from 'react';

export const ToggleButton = memo(function ToggleButton({
  active,
  ...props
}: IButtonProps & {active: boolean}) {
  return (
    <Button
      {...props}
      alignItems="center"
      justifyContent="center"
      variant="outline"
      borderColor={active ? 'primary.600' : 'muted.400'}
      _text={{
        color: active ? 'primary.600' : 'dark.200',
        _dark: {
          color: active ? 'primary.400' : 'light.300',
        },
      }}
      _dark={{
        borderColor: active ? 'primary.400' : 'muted.400',
      }}>
      {props.children}
    </Button>
  );
});
