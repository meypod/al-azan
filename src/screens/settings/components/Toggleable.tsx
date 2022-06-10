import {Button, HStack, Text, IStackProps} from 'native-base';
import type {GestureResponderEvent} from 'react-native';

type ToggleableProps = {
  enabledLabel?: string;
  disabledLabel?: string;
  isEnabled: boolean;
  action: ((event: GestureResponderEvent) => void) | undefined | null;
  children: React.ReactNode;
} & IStackProps;

export function Toggleable(props: ToggleableProps) {
  const {
    action,
    children,
    isEnabled,
    disabledLabel = 'Disabled',
    enabledLabel = 'Enabled',
    ...otherProps
  } = props;
  return (
    <HStack
      alignItems="center"
      justifyContent="center"
      space="md"
      {...otherProps}>
      <Text>{children}</Text>
      <Button onPress={action}>
        {isEnabled ? enabledLabel?.toString() : disabledLabel?.toString()}
      </Button>
    </HStack>
  );
}
