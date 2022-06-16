import {VStack, IStackProps} from 'native-base';
import {LanguageSettings} from '@/screens/settings/components/LanguageSettings';
import {ThemeSettings} from '@/screens/settings/components/ThemeSettings';

export function DisplaySettings(props: IStackProps) {
  return (
    <VStack p="4" {...props}>
      <ThemeSettings mb="4" />
      <LanguageSettings />
    </VStack>
  );
}
