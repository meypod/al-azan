import {ScrollView, IScrollViewProps} from 'native-base';
import {CalendarSecondarySettings} from './calendar_secondary_settings';
import {CalendarSettings} from '@/screens/settings_display/calendar_settings';
import {HidePrayerSettings} from '@/screens/settings_display/hide_prayer_settings';
import {LanguageSettings} from '@/screens/settings_display/language_settings';
import {NumberFormatSettings} from '@/screens/settings_display/number_format_settings';
import {ThemeSettings} from '@/screens/settings_display/theme_settings';
import {TimeFormatSettings} from '@/screens/settings_display/time_format_settings';

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
      <TimeFormatSettings mb="6" />
      <NumberFormatSettings mb="6" />
      <CalendarSettings mb="6" />
      <CalendarSecondarySettings mb="6" />
    </ScrollView>
  );
}
