import {t} from '@lingui/macro';
import notifee, {AlarmType} from '@notifee/react-native';
import {setAlarmTask, SetAlarmTaskOptions} from './set_alarm';
import {setPreAlarmTask} from './set_pre_alarm';
import {getNextPrayerByDays} from '@/adhan';
import {
  PRE_REMINDER_CHANNEL_ID,
  REMINDER_CHANNEL_ID,
  REMINDER_DND_CHANNEL_ID,
} from '@/constants/notification';
import {getReminderSubtitle} from '@/screens/settings_reminders/reminder_item';
import {alarmSettings} from '@/store/alarm';
import {reminderSettings, Reminder} from '@/store/reminder';
import {settings} from '@/store/settings';
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

  const {BYPASS_DND} = settings.getState();
  const {DONT_TURN_ON_SCREEN, VIBRATION_MODE} = alarmSettings.getState();

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
  const tasks = [];

  for (const reminder of reminders.filter(r => r.enabled)) {
    const dismissedAlarmTS =
      settings.getState().DELIVERED_ALARM_TIMESTAMPS[reminder.id] || 0;

    let prayerTime = getNextPrayerByDays({
      date: date,
      days: reminder.days,
      prayers: [reminder.prayer],
    });
    if (!prayerTime) continue;

    let triggerDate = new Date(
      prayerTime.date.valueOf() + reminder.duration * reminder.durationModifier,
    );

    if (
      triggerDate.valueOf() < Date.now() ||
      dismissedAlarmTS >= triggerDate.valueOf()
    ) {
      prayerTime = getNextPrayerByDays({
        date: new Date(
          date.valueOf() + (Date.now() - triggerDate.valueOf() + 20_000),
        ),
        days: reminder.days,
        prayers: [reminder.prayer],
      });
      if (!prayerTime) continue;
      triggerDate = new Date(
        prayerTime.date.valueOf() +
          reminder.duration * reminder.durationModifier,
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
      notifChannelId: BYPASS_DND
        ? REMINDER_DND_CHANNEL_ID
        : REMINDER_CHANNEL_ID,
      isReminder: true,
      sound: reminder.sound,
      once: reminder.once,
      alarmType: settings.getState().USE_DIFFERENT_ALARM_TYPE
        ? AlarmType.SET_EXACT_AND_ALLOW_WHILE_IDLE
        : AlarmType.SET_ALARM_CLOCK,
      dontTurnOnScreen: DONT_TURN_ON_SCREEN,
      vibrationMode: VIBRATION_MODE,
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
