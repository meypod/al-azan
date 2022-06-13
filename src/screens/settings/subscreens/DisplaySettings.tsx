import {VStack, IStackProps} from 'native-base';
import {ThemeSettings} from '@/screens/settings/components/ThemeSettings';

export function DisplaySettings(props: IStackProps) {
  return (
    <VStack p="4" {...props}>
      <ThemeSettings></ThemeSettings>
    </VStack>
  );
}
