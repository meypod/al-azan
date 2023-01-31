import {t} from '@lingui/macro';
import notifee, {
  TimestampTrigger,
  TriggerType,
  AndroidImportance,
  AndroidCategory,
  AndroidVisibility,
} from '@notifee/react-native';
import {getPrayerTimes, PrayersInOrder} from '@/adhan';
import {
  WIDGET_UPDATE_CHANNEL_ID,
  WIDGET_UPDATE_CHANNEL_NAME,
} from '@/constants/notification';
import {settings} from '@/store/settings';
import {getNextDayBeginning} from '@/utils/date';

async function createNotificationTrigger(channelId: string, timestamp: number) {
  // for 00:00 updates
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp,
  };

  await notifee
    .createTriggerNotification(
      {
        title: t`Updating widgets`,
        android: {
          smallIcon: 'ic_stat_name',
          channelId,
          category: AndroidCategory.SERVICE,
          importance: AndroidImportance.MIN,
          asForegroundService: false,
          ongoing: true,
          progress: {
            indeterminate: true,
          },
        },
      },
      trigger,
    )
    .catch(console.error);
}

export async function setUpdateWidgetsAlarms() {
  let targetDate = new Date();

  let {LAST_WIDGET_UPDATE} = settings.getState();

  // when the last alarm goes off, it gets past this if
  // because till the last alarm, this condition always returns
  // so that we dont end up setting many alarms
  if (targetDate.valueOf() < LAST_WIDGET_UPDATE) return;

  let prayerTimes = getPrayerTimes(targetDate);

  if (!prayerTimes) return; // cant get prayer times to set alarms

  const begginingOfNextDay = getNextDayBeginning(targetDate).valueOf();
  LAST_WIDGET_UPDATE = begginingOfNextDay;

  const channelId = await notifee.createChannel({
    id: WIDGET_UPDATE_CHANNEL_ID,
    name: WIDGET_UPDATE_CHANNEL_NAME,
    importance: AndroidImportance.MIN,
    visibility: AndroidVisibility.SECRET,
    lights: false,
    badge: false,
    vibration: false,
  });

  // for 00:00 updates
  const tasks = [createNotificationTrigger(channelId, begginingOfNextDay)];

  for (const prayer of PrayersInOrder) {
    tasks.push(
      createNotificationTrigger(channelId, prayerTimes[prayer].valueOf()),
    );
    if (prayerTimes[prayer].valueOf() > LAST_WIDGET_UPDATE) {
      LAST_WIDGET_UPDATE = prayerTimes[prayer].valueOf();
    }
  }

  settings.setState({LAST_WIDGET_UPDATE});

  await Promise.all(tasks);
}
