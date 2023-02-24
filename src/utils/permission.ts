import {i18n} from '@lingui/core';
import {t} from '@lingui/macro';
import notifee, {
  AndroidImportance,
  AndroidNotificationSetting,
  AndroidVisibility,
  AuthorizationStatus,
} from '@notifee/react-native';
import {Alert, PermissionsAndroid, Platform} from 'react-native';
import {
  ADHAN_CHANNEL_ID,
  channelNameTranslations,
  PRE_ADHAN_CHANNEL_ID,
  PRE_REMINDER_CHANNEL_ID,
  REMINDER_CHANNEL_ID,
  WIDGET_CHANNEL_ID,
  WIDGET_UPDATE_CHANNEL_ID,
} from '@/constants/notification';
import {openApplicationSettings} from '@/modules/activity';
import {settings} from '@/store/settings';
import {setNextAdhan} from '@/tasks/set_next_adhan';

/** returns `true` if we can schedule notifications and expect them to trigger */
async function askNotificationPermission() {
  let permissionGiven = true;
  if (Platform.Version >= 33) {
    const notifySettings = await notifee.getNotificationSettings();
    // notification permissions do not exist before android 13 (api 33)
    permissionGiven =
      notifySettings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
      notifySettings.authorizationStatus === AuthorizationStatus.NOT_DETERMINED;
    if (
      notifySettings.authorizationStatus === AuthorizationStatus.DENIED &&
      !settings.getState().DONT_ASK_PERMISSION_NOTIFICATIONS
    ) {
      Alert.alert(
        t`Notifications Permission`,
        t`To see notifications about adhan, we need your permission.`,
        [
          {
            text: t`Don't ask again`,
            style: 'destructive',
            onPress: () =>
              settings.setState({DONT_ASK_PERMISSION_NOTIFICATIONS: true}),
          },
          {
            text: t`Okay`,
            style: 'default',
            onPress: () =>
              PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
              ).then(result => {
                if (result === 'denied') {
                  notifee.openNotificationSettings();
                } else {
                  permissionGiven = true;
                  setNextAdhan();
                }
              }),
          },
        ],
        {
          cancelable: true,
        },
      );
    }
  }
  if (permissionGiven) {
    // create channels early for user access

    // Alarms
    await notifee.createChannel({
      id: ADHAN_CHANNEL_ID,
      name: i18n._(channelNameTranslations['ADHAN_CHANNEL_NAME']),
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
    });
    await notifee.createChannel({
      id: REMINDER_CHANNEL_ID,
      name: i18n._(channelNameTranslations['REMINDER_CHANNEL_NAME']),
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
    });

    // Pre alarms
    await notifee.createChannel({
      id: PRE_ADHAN_CHANNEL_ID,
      name: i18n._(channelNameTranslations['PRE_ADHAN_CHANNEL_NAME']),
      visibility: AndroidVisibility.PUBLIC,
    });
    await notifee.createChannel({
      id: PRE_REMINDER_CHANNEL_ID,
      name: i18n._(channelNameTranslations['PRE_REMINDER_CHANNEL_NAME']),
      visibility: AndroidVisibility.PUBLIC,
    });

    // Widget related
    await notifee.createChannel({
      id: WIDGET_CHANNEL_ID,
      name: i18n._(channelNameTranslations['WIDGET_CHANNEL_NAME']),
      importance: AndroidImportance.LOW,
      visibility: AndroidVisibility.PUBLIC,
    });
    // for updating widgets silently
    await notifee.createChannel({
      id: WIDGET_UPDATE_CHANNEL_ID,
      name: i18n._(channelNameTranslations['WIDGET_UPDATE_CHANNEL_NAME']),
      importance: AndroidImportance.MIN,
      visibility: AndroidVisibility.SECRET,
      lights: false,
      badge: false,
      vibration: false,
    });
  }
}

async function askAlarmPermission() {
  const notifySettings = await notifee.getNotificationSettings();
  if (
    notifySettings.android.alarm === AndroidNotificationSetting.DISABLED &&
    !settings.getState().DONT_ASK_PERMISSION_ALARM
  ) {
    Alert.alert(
      t`Alarms Permission`,
      t`On Android 12 and newer, the app also needs alarms permission to work properly, so you must allow this as well.`,
      [
        {
          text: t`Don't ask again`,
          style: 'destructive',
          onPress: () => settings.setState({DONT_ASK_PERMISSION_ALARM: true}),
        },
        {
          text: t`Not now`,
          style: 'cancel',
        },
        {
          text: t`Show settings`,
          style: 'default',
          onPress: () => notifee.openAlarmPermissionSettings(),
        },
      ],
      {
        cancelable: true,
      },
    );
  }
}

async function askPhoneStatePermission() {
  const granted = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
  );

  if (!granted && !settings.getState().DONT_ASK_PERMISSION_PHONE_STATE) {
    Alert.alert(
      t`Phone State Permission`,
      t`To stop playing adhan when you receive a call, we need to read your phone state. not allowing this permission simply disables the feature.`,
      [
        {
          text: t`Don't ask again`,
          style: 'destructive',
          onPress: () =>
            settings.setState({DONT_ASK_PERMISSION_PHONE_STATE: true}),
        },
        {
          text: t`Okay`,
          style: 'default',
          onPress: () =>
            PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
            ).then(result => {
              if (result === 'denied') {
                openApplicationSettings();
              } else {
                setNextAdhan();
              }
            }),
        },
      ],
      {
        cancelable: true,
      },
    );
  }
}

export async function askPermissions() {
  await askNotificationPermission();
  await askAlarmPermission();
  if (Platform.Version >= 31) {
    // we only need this permission to react to incomming calls on android 12 (api 31) and later
    await askPhoneStatePermission();
  }
}

/** returns `true` if we can schedule notifications and expect them to trigger */
export async function canScheduleNotifications() {
  const notifySettings = await notifee.getNotificationSettings();
  return (
    (notifySettings.android.alarm === AndroidNotificationSetting.ENABLED ||
      notifySettings.android.alarm ===
        AndroidNotificationSetting.NOT_SUPPORTED) &&
    notifySettings.authorizationStatus === AuthorizationStatus.AUTHORIZED
  );
}
