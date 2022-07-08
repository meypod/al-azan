import {ScrollView, IScrollViewProps} from 'native-base';
import {HidePrayerSettings} from '@/screens/settings_display/hide_prayer_settings';
import {LanguageSettings} from '@/screens/settings_display/language_settings';
import {ThemeSettings} from '@/screens/settings_display/theme_settings';

export function DisplaySettings(props: IScrollViewProps) {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      p="4"
      _contentContainerStyle={{paddingBottom: 40}}
      {...props}>
      <ThemeSettings mb="4" />
      <LanguageSettings mb="6" />
      <HidePrayerSettings />
    </ScrollView>
  );
}
