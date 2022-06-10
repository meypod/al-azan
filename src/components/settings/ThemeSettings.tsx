import {t} from '@lingui/macro';
import {
  useColorMode,
  HStack,
  FormControl,
  Radio,
  IStackProps,
  Text,
} from 'native-base';
import {isRTL} from '@/i18n';

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
        <FormControl.Label flexDirection={isRTL ? 'row-reverse' : 'row'}>
          {t`Theme Color`}:
        </FormControl.Label>
        <HStack flexDirection={isRTL ? 'row-reverse' : 'row'}>
          <Radio.Group
            name="colorMode"
            defaultValue={colorMode || 'light'}
            accessibilityLabel={t`Theme Color`}
            onChange={changeColor}>
            <HStack mb="3">
              <Radio value="light">
                <Text fontSize="sm">{t`Light`}</Text>
              </Radio>
              <Radio value="dark" ml="4">
                <Text fontSize="sm">{t`Dark`}</Text>
              </Radio>
            </HStack>
          </Radio.Group>
        </HStack>
      </FormControl>
    </HStack>
  );
}
