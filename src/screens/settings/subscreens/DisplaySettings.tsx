import {VStack, IStackProps} from 'native-base';
import {HidePrayerSettings} from '@/screens/settings/components/HidePrayerSettings';
import {LanguageSettings} from '@/screens/settings/components/LanguageSettings';
import {ThemeSettings} from '@/screens/settings/components/ThemeSettings';

export function DisplaySettings(props: IStackProps) {
  return (
    <VStack p="4" {...props}>
      <ThemeSettings mb="4" />
      <LanguageSettings mb="6" />
      <HidePrayerSettings />
    </VStack>
  );
}
