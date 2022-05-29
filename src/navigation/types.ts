import {MessageDescriptor} from '@lingui/core';
import {defineMessage} from '@lingui/macro';

export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  FullscreenAlarm: {options: string};
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export const routeTranslations = {
  Settings: defineMessage({
    id: 'settings',
    message: 'Settings',
  }),
  Home: defineMessage({
    id: 'home',
    message: 'Home',
  }),
  FullscreenAlarm: defineMessage({
    id: 'fullscreen_alarm',
    message: 'Playing Adhan',
    comment: 'screen route name',
  }),
} as Record<string, MessageDescriptor>;
