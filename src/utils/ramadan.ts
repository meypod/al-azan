import {t} from '@lingui/macro';
import notifee from '@notifee/react-native';
import {Alert} from 'react-native';
import {getHijriDay, getHijriMonth, getHijriYear} from './date';
import {
  IMPORTANT_CHANNEL_ID,
  RAMADAN_NOTICE_NOTIFICATION_ID,
} from '@/constants/notification';
import {settings} from '@/store/settings';

function isRamadanNoticeDismissedThisYear() {
  if (settings.getState().RAMADAN_REMINDED_YEAR === getHijriYear(new Date())) {
    return true;
  }
  return false;
}

export function isRamadan(date: Date) {
  return getHijriMonth(date) === '9';
}

export function isRamadanEnding() {
  const today = new Date();
  if (isRamadan(today) && parseInt(getHijriDay(today)) > 24) {
    return true;
  }
  return false;
}

export function isShaaban(date: Date) {
  return getHijriMonth(date) === '8';
}

export function isRamadanNear() {
  const today = new Date();
  if (isShaaban(today) && parseInt(getHijriDay(today)) > 24) {
    return true;
  }
  return false;
}

export function shouldShowRamadanNotice() {
  if (settings.getState().RAMADAN_REMINDER_DONT_SHOW) {
    return false;
  }
  return (
    !isRamadanNoticeDismissedThisYear() &&
    (isRamadanNear() || isRamadanEnding())
  );
}

function getNoticeMessage() {
  return t`since the app's calendar is pre-calculated and not based on moon sightings, it may show incorrect date for the start and the end of Ramadan.`;
}

function getRamadanStartingMsg() {
  return t`Ramadan is near,` + ' ' + getNoticeMessage();
}

export function getRamadanEndingMsg() {
  return t`Ramadan is ending,` + ' ' + getNoticeMessage();
}

export function dontShowRamadanNoticeAgain() {
  settings.setState({RAMADAN_REMINDER_DONT_SHOW: true});
}

export function dismissRamadanNoticeForThisYear() {
  settings.setState({RAMADAN_REMINDED_YEAR: getHijriYear(new Date())});
}

export function showRamadanAlert() {
  Alert.alert(
    t`Attention`,
    isRamadanNear() ? getRamadanStartingMsg() : getRamadanEndingMsg(),
    [
      {
        text: t`Remind me next year`,
        style: 'default',
        onPress: () => dismissRamadanNoticeForThisYear(),
      },
      {
        text: t`Don't show again`,
        onPress: () => dontShowRamadanNoticeAgain(),
        style: 'destructive',
      },
    ],
  );
}

export async function notifyRamadanNotice() {
  await notifee
    .displayNotification({
      id: RAMADAN_NOTICE_NOTIFICATION_ID,
      title: t`Attention`,
      body: isRamadanNear() ? getRamadanStartingMsg() : getRamadanEndingMsg(),
      android: {
        channelId: IMPORTANT_CHANNEL_ID,
        pressAction: {
          id: 'default',
        },
        actions: [
          {
            title: t`Remind me next year`,
            pressAction: {
              id: 'remind_next_year',
            },
          },
          {
            title: t`Don't show again`,
            pressAction: {
              id: 'dont_show_again',
            },
          },
        ],
      },
    })
    .catch(console.error);
}
