import {VStack, IStackProps} from 'native-base';
import {ThemeSettings} from '@/screens/settings/components/ThemeSettings';

export function DisplaySettings(props: IStackProps) {
  return (
    <VStack {...props}>
      <ThemeSettings></ThemeSettings>
    </VStack>
  );
}
