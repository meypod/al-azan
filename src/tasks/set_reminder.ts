import {t} from '@lingui/macro';
import notifee, {AlarmType} from '@notifee/react-native';
import {setAlarmTask, SetAlarmTaskOptions} from './set_alarm';
import {setPreAlarmTask} from './set_pre_alarm';
import {getPrayerTimes} from '@/adhan';
import {
  PRE_REMINDER_CHANNEL_ID,
  REMINDER_CHANNEL_ID,
} from '@/constants/notification';
import {getReminderSubtitle} from '@/screens/settings_reminders/reminder_item';
import {reminderSettings, Reminder} from '@/store/reminder';
import {settings} from '@/store/settings';
import {getNextDayBeginning} from '@/utils/date';
import {canScheduleNotifications} from '@/utils/permission';
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

  {
    // we dont need reminderIdsToCancel out of this scope, hence the extra {}
    let reminderIdsToCancel: Array<string>;
    if (force) {
      reminderIdsToCancel = reminders.map(r => r.id);
      settings.getState().deleteTimestamps(reminderIdsToCancel);
    } else {
      reminderIdsToCancel = reminders.filter(r => !r.enabled).map(r => r.id);
    }
    await Promise.all([
      notifee.cancelAllNotifications(reminderIdsToCancel).catch(console.error),
      notifee
        .cancelAllNotifications(reminderIdsToCancel.map(id => 'pre-' + id))
        .catch(console.error),
    ]);
  }

  if (!(await canScheduleNotifications())) {
    return;
  }

  const date = new Date();

  let prayerTimes = getPrayerTimes(date);
  let tomorrowPrayerTimes = getPrayerTimes(getNextDayBeginning(date));

  if (!prayerTimes || !tomorrowPrayerTimes) return;

  const tasks = [];

  for (const reminder of reminders.filter(r => r.enabled)) {
    const dismissedAlarmTS =
      settings.getState().DELIVERED_ALARM_TIMESTAMPS[reminder.id] || 0;

    let pTime = prayerTimes[reminder.prayer].valueOf();
    let triggerDate = new Date(
      pTime + reminder.duration * reminder.durationModifier,
    );

    if (
      triggerDate.valueOf() < Date.now() ||
      dismissedAlarmTS >= triggerDate.valueOf()
    ) {
      pTime = tomorrowPrayerTimes[reminder.prayer].valueOf();
      triggerDate = new Date(
        pTime + reminder.duration * reminder.durationModifier,
      );
    }

    if (triggerDate.valueOf() < Date.now()) continue;

    if (!force && dismissedAlarmTS >= triggerDate.valueOf()) continue;

    const reminderOptions: SetAlarmTaskOptions & {once?: boolean} = {
      title: t`Reminder`,
      body: reminder.label || '',
      subtitle: getReminderSubtitle(reminder),
      date: triggerDate,
      prayer: reminder.prayer,
      notifId: reminder.id,
      notifChannelId: REMINDER_CHANNEL_ID,
      isReminder: true,
      sound: reminder.sound,
      once: reminder.once,
      alarmType: settings.getState().USE_DIFFERENT_ALARM_TYPE
        ? AlarmType.SET_EXACT_AND_ALLOW_WHILE_IDLE
        : AlarmType.SET_ALARM_CLOCK,
    };

    tasks.push(
      setAlarmTask(reminderOptions)
        .then(() =>
          setPreAlarmTask({
            ...reminderOptions,
            notifId: 'pre-' + reminder.id,
            notifChannelId: PRE_REMINDER_CHANNEL_ID,
            targetAlarmNotifId: reminder.id,
          }),
        )
        .then(() => {
          if (!noToast) {
            showUpcomingToast({
              message:
                t`Reminder` +
                ': ' +
                (reminder.label ? reminder.label + ', ' : ''),
              date: triggerDate,
            });
          }
        })
        .catch(console.error),
    );
  }

  await Promise.all(tasks);

  return Promise.resolve();
}
