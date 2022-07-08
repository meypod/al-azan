import {t} from '@lingui/macro';
import {
  useColorMode,
  HStack,
  FormControl,
  Radio,
  IStackProps,
  Text,
} from 'native-base';
import {useSettingsHelper} from '@/store/settings';

export function ThemeSettings(props: IStackProps) {
  const {setColorMode} = useColorMode();

  const [themeColor] = useSettingsHelper('THEME_COLOR');

  const changeColor = (colorString: string) => {
    setColorMode(colorString);
  };

  return (
    <HStack {...props}>
      <FormControl fontSize="md">
        <FormControl.Label>{t`Theme Color`}:</FormControl.Label>
        <HStack>
          <Radio.Group
            name="colorMode"
            defaultValue={themeColor as string}
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
            <Radio value="default">
              <Text fontSize="sm">{t`System Default`}</Text>
            </Radio>
          </Radio.Group>
        </HStack>
      </FormControl>
    </HStack>
  );
}
