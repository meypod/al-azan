import {ScrollView, IScrollViewProps} from 'native-base';
import {HidePrayerSettings} from '@/screens/settings_display/HidePrayerSettings';
import {LanguageSettings} from '@/screens/settings_display/LanguageSettings';
import {ThemeSettings} from '@/screens/settings_display/ThemeSettings';

export function DisplaySettings(props: IScrollViewProps) {
  return (
    <ScrollView p="4" {...props}>
      <ThemeSettings mb="4" />
      <LanguageSettings mb="6" />
      <HidePrayerSettings />
    </ScrollView>
  );
}
