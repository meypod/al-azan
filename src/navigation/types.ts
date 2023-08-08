import {MessageDescriptor, i18n} from '@lingui/core';
import {defineMessage} from '@lingui/macro';

export type RootStackParamList = {
  Intro: undefined;
  Home: undefined;
  Settings: undefined;
  FullscreenAlarm: {options: string};
  BackupSettings: undefined;
  DisplaySettings: undefined;
  LocationSettings: undefined;
  NotificationSettings: undefined;
  NotificationAdvancedSettings: undefined;
  AdhanSettings: undefined;
  CalculationSettings: undefined;
  CalculationAdjustmentsSettings: undefined;
  CalculationAdvancedSettings: undefined;
  FixCommonProblemsSettings: undefined;
  WidgetSettings: undefined;
  RemindersSettings: undefined;
  AboutSettings: undefined;
  DevSettings: undefined;
  QiblaFinder: undefined;
  QiblaMap: undefined;
  QiblaCompass: {skipInit?: boolean} | undefined;
  QadaCounter: undefined;
  FavoriteLocations: undefined;
  MonthlyView: undefined | {subtitle: string};
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const routeTranslations = {
  Intro: defineMessage({
    id: 'intro',
    message: '',
  }),
  Home: defineMessage({
    id: 'home',
    message: 'Home',
  }),
  Settings: defineMessage({
    id: 'settings',
    message: 'Settings',
  }),
  FullscreenAlarm: defineMessage({
    id: 'fullscreen_alarm',
    message: 'Playing Adhan',
    comment: 'screen title',
  }),
  BackupSettings: defineMessage({
    id: 'backup_settings',
    message: 'Backup',
    comment: 'screen title',
  }),
  DisplaySettings: defineMessage({
    id: 'display_settings',
    message: 'Display',
    comment: 'screen title',
  }),
  LocationSettings: defineMessage({
    id: 'location_settings',
    message: 'Location',
    comment: 'screen title',
  }),
  NotificationSettings: defineMessage({
    id: 'notification_settings',
    message: 'Notification & Sound',
    comment: 'screen title',
  }),
  NotificationAdvancedSettings: defineMessage({
    id: 'notification_advanced_settings',
    message: 'Advanced Settings',
    comment: 'screen title',
  }),
  AdhanSettings: defineMessage({
    id: 'muezzin_settings',
    message: 'Muezzin',
    comment: 'screen title',
  }),
  CalculationSettings: defineMessage({
    id: 'calculation_settings',
    message: 'Calculation',
    comment: 'screen title',
  }),
  CalculationAdjustmentsSettings: defineMessage({
    id: 'calculation_adjustments_settings',
    message: 'Adjustments',
    comment: 'screen title',
  }),
  CalculationAdvancedSettings: defineMessage({
    id: 'calculation_advanced_settings',
    message: 'Advanced Calculation Settings',
    comment: 'screen title',
  }),
  FixCommonProblemsSettings: defineMessage({
    message: 'Fix Common Problems',
    comment: 'screen title',
  }),
  WidgetSettings: defineMessage({
    id: 'widget_settings',
    message: 'Widget Settings',
    comment: 'screen title',
  }),
  RemindersSettings: defineMessage({
    id: 'reminders_settings',
    message: 'Reminders',
    comment: 'screen title',
  }),
  AboutSettings: defineMessage({
    id: 'about_settings',
    message: 'About',
    comment: 'screen title',
  }),
  DevSettings: defineMessage({
    id: 'dev_settings',
    message: 'Developer',
    comment: 'screen title',
  }),
  QiblaFinder: defineMessage({
    id: 'qibla_finder',
    message: 'Qibla Finder',
  }),
  QiblaMap: defineMessage({
    id: 'qibla_map',
    message: 'Qibla Map',
  }),
  QiblaCompass: defineMessage({
    id: 'qibla_compass',
    message: 'Qibla Compass',
  }),
  QadaCounter: defineMessage({
    id: 'qada_counter',
    message: 'Qada Counter',
    comment: 'Title of the page where you can count your Qada prayers and fast',
  }),
  FavoriteLocations: defineMessage({
    id: 'favorite_location',
    message: 'Favorite Locations',
    comment:
      'Title of the page where you add your favorite locations for faster switch',
  }),
  MonthlyView: defineMessage({
    id: 'monthly_view',
    message: 'Monthly View',
  }),
} as Record<string, MessageDescriptor>;

export function translateRoute(name: string) {
  return i18n._(routeTranslations[name]);
}
