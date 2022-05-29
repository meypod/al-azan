import {
  useColorMode,
  HStack,
  FormControl,
  Radio,
  IStackProps,
  Text,
} from 'native-base';

export function ThemeSettings(props: IStackProps) {
  const {colorMode, toggleColorMode} = useColorMode();

  const changeColor = (newColorMode: string) => {
    if (newColorMode !== colorMode) {
      toggleColorMode();
    }
  };

  return (
    <HStack {...props}>
      <FormControl fontSize="md">
        <FormControl.Label>Theme Color:</FormControl.Label>
        <Radio.Group
          name="colorMode"
          defaultValue={colorMode || 'light'}
          accessibilityLabel="Theme Color"
          onChange={changeColor}>
          <HStack mb="3">
            <Radio value="light">
              <Text fontSize="sm">Light</Text>
            </Radio>
            <Radio value="dark" ml="4">
              <Text fontSize="sm">Dark</Text>
            </Radio>
          </HStack>
        </Radio.Group>
      </FormControl>
    </HStack>
  );
}
