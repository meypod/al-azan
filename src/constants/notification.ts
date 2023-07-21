import {MessageDescriptor} from '@lingui/core';
import {defineMessage} from '@lingui/macro';

export const ADHAN_CHANNEL_ID = 'adhan-channel-1';
export const ADHAN_DND_CHANNEL_ID = 'adhan-dnd-channel-1';
export const ADHAN_NOTIFICATION_ID = 'adhan-trigger-notification';

export const PRE_ADHAN_CHANNEL_ID = 'pre-adhan-channel';
export const PRE_ADHAN_NOTIFICATION_ID = 'pre-adhan-trigger-notification';

export const WIDGET_CHANNEL_ID = 'widget-channel';
export const WIDGET_NOTIFICATION_ID = 'widget-notification';

export const WIDGET_UPDATE_CHANNEL_ID = 'widget-update-channel';
export const WIDGET_UPDATE_NOTIFICATION_ID = 'widget-update-notification';

export const REMINDER_CHANNEL_ID = 'reminder-channel-1';
export const REMINDER_DND_CHANNEL_ID = 'reminder-dnd-channel-1';
export const PRE_REMINDER_CHANNEL_ID = 'pre-reminder-channel';

export const IMPORTANT_CHANNEL_ID = 'important-channel';
export const RAMADAN_NOTICE_NOTIFICATION_ID = 'ramadan-notice-notification';

export const channelNameTranslations = {
  ADHAN_CHANNEL_NAME: defineMessage({
    id: 'ADHAN_CHANNEL_NAME',
    message: 'Adhan',
  }),
  PRE_ADHAN_CHANNEL_NAME: defineMessage({
    id: 'PRE_ADHAN_CHANNEL_NAME',
    message: 'Upcoming adhan',
  }),
  WIDGET_CHANNEL_NAME: defineMessage({
    id: 'WIDGET_CHANNEL_NAME',
    message: 'Widget',
  }),
  WIDGET_UPDATE_CHANNEL_NAME: defineMessage({
    id: 'WIDGET_UPDATE_CHANNEL_NAME',
    message: 'Widget Update',
  }),
  REMINDER_CHANNEL_NAME: defineMessage({
    id: 'REMINDER_CHANNEL_NAME',
    message: 'Reminder',
  }),
  PRE_REMINDER_CHANNEL_NAME: defineMessage({
    id: 'PRE_REMINDER_CHANNEL_NAME',
    message: 'Upcoming reminder',
  }),
  IMPORTANT_CHANNEL_ID: defineMessage({
    id: 'IMPORTANT_CHANNEL_ID',
    message: 'Important',
  }),
} as Record<string, MessageDescriptor>;
