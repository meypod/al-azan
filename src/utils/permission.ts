import {t} from '@lingui/macro';
import notifee, {
  AndroidNotificationSetting,
  AuthorizationStatus,
} from '@notifee/react-native';
import {Alert, PermissionsAndroid, Platform} from 'react-native';
import {openApplicationSettings} from '@/modules/activity';
import {settings} from '@/store/settings';
import {setNextAdhan} from '@/tasks/set_next_adhan';

/** returns `true` if we can schedule notifications and expect them to trigger */
async function askNotificationPermission() {
  if (Platform.Version >= 33) {
    const notifySettings = await notifee.getNotificationSettings();
    // notification permissions do not exist before android 13 (api 33)
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
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATION,
              ).then(result => {
                if (result === 'denied') {
                  notifee.openNotificationSettings();
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
