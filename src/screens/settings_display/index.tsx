import {ScrollView, IScrollViewProps} from 'native-base';
import {CalendarLunarSettings} from './calendar_lunar_settings';
import {CalendarSecondarySettings} from './calendar_secondary_settings';
import {HighlightCurrentSetting} from './highlight_current_setting';
import {SafeArea} from '@/components/safe_area';
import {HidePrayerSettings} from '@/screens/settings_display/hide_prayer_settings';
import {LanguageSettings} from '@/screens/settings_display/language_settings';
import {NumberFormatSettings} from '@/screens/settings_display/number_format_settings';
import {ThemeSettings} from '@/screens/settings_display/theme_settings';
import {TimeFormatSettings} from '@/screens/settings_display/time_format_settings';

export function DisplaySettings(props: IScrollViewProps) {
  return (
    <SafeArea>
      <ScrollView p="4" _contentContainerStyle={{paddingBottom: 40}} {...props}>
        <ThemeSettings mb="4" />
        <LanguageSettings mb="6" />
        <HidePrayerSettings />
        <TimeFormatSettings mb="6" />
        <NumberFormatSettings mb="6" />
        <CalendarLunarSettings mb="6" />
        <CalendarSecondarySettings mb="6" />
        <HighlightCurrentSetting mb="6" />
      </ScrollView>
    </SafeArea>
  );
}
