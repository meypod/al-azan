import {t} from '@lingui/macro';
import notifee from '@notifee/react-native';
import {setAlarmTask, SetAlarmTaskOptions} from './set_alarm';
import {setPreAlarmTask} from './set_pre_alarm';
import {getPrayerTimes} from '@/adhan';
import {
  PRE_REMINDER_CHANNEL_ID,
  PRE_REMINDER_CHANNEL_NAME,
  REMINDER_CHANNEL_ID,
  REMINDER_CHANNEL_NAME,
} from '@/constants/notification';
import {getReminderSubtitle} from '@/screens/settings_reminders/reminder_item';
import {reminderSettings, Reminder} from '@/store/reminder';
import {settings} from '@/store/settings';
import {getNextDayBeginning} from '@/utils/date';
import {showUpcomingToast} from '@/utils/upcoming';

type SetReminderOptions = {
  noToast?: boolean;
  reminders?: Array<Reminder>;
  /** should the reminders be forced to reschedule */
  force?: boolean;
};

export async function setReminders(options?: SetReminderOptions) {
  const {
    reminders = reminderSettings.getState().REMINDERS,
    noToast = false,
    force = false,
  } = options || {};

  const date = new Date();

  let prayerTimes = getPrayerTimes(date);
  let tomorrowPrayerTimes = getPrayerTimes(getNextDayBeginning(date));

  if (!prayerTimes || !tomorrowPrayerTimes) return;

  {
    // we dont need reminderIdsToCancel out of this scope, hence the extra {}
    let reminderIdsToCancel: Array<string>;
    if (force) {
      reminderIdsToCancel = reminders.map(r => r.id);
    } else {
      reminderIdsToCancel = reminders.filter(r => !r.enabled).map(r => r.id);
    }
    await notifee
      .cancelTriggerNotifications(reminderIdsToCancel)
      .catch(console.error);
  }

  for (const reminder of reminders.filter(r => r.enabled)) {
    let pTime = prayerTimes[reminder.prayer].getTime();
    if (pTime + reminder.duration * reminder.durationModifier < Date.now()) {
      pTime = tomorrowPrayerTimes[reminder.prayer].getTime();
    }

    const triggerDate = new Date(
      pTime + reminder.duration * reminder.durationModifier,
    );

    if (triggerDate.getTime() < Date.now()) continue;

    const dismissedAlarmTS =
      settings.getState().DISMISSED_ALARM_TIMESTAMPS[reminder.id] || 0;

    if (!force && dismissedAlarmTS >= triggerDate.getTime()) continue;

    const reminderOptions: SetAlarmTaskOptions & {once?: boolean} = {
      title: t`Reminder`,
      body: reminder.label || '',
      subtitle: getReminderSubtitle(reminder),
      date: triggerDate,
      prayer: reminder.prayer,
      notifId: reminder.id,
      notifChannelId: REMINDER_CHANNEL_ID,
      notifChannelName: REMINDER_CHANNEL_NAME,
      isReminder: true,
      playSound: !!reminder.playSound,
      once: reminder.once,
    };

    await setPreAlarmTask({
      ...reminderOptions,
      notifId: 'pre-' + reminder.id,
      notifChannelId: PRE_REMINDER_CHANNEL_ID,
      notifChannelName: PRE_REMINDER_CHANNEL_NAME,
      targetAlarmNotifId: reminder.id,
    })
      .then(() => setAlarmTask(reminderOptions))
      .catch(console.error);

    if (!noToast) {
      showUpcomingToast({
        message:
          t`Reminder` + ': ' + (reminder.label ? reminder.label + ', ' : ''),
        date: triggerDate,
      });
    }
  }

  return Promise.resolve();
}
