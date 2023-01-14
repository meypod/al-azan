import {t} from '@lingui/macro';
import notifee, {
  AndroidNotificationSetting,
  AuthorizationStatus,
} from '@notifee/react-native';
import {Alert, PermissionsAndroid, Platform} from 'react-native';
import {openApplicationSettings} from '@/modules/activity';
import {isAnyNotificationEnabled} from '@/store/alarm';
import {settings} from '@/store/settings';

/** returns `true` if we can schedule notifications and expect them to trigger */
async function askNotificationPermission() {
  if (isAnyNotificationEnabled()) {
    const notifySettings = await notifee.getNotificationSettings();
    if (!settings.getState().DONT_ASK_PERMISSION_NOTIFICATIONS) {
      if (notifySettings.authorizationStatus === AuthorizationStatus.DENIED) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATION,
          {
            title: t`Notifications Permission`,
            message: t`To see notifications about adhan, we need your permission.`,
            buttonNegative: Platform.Version <= 30 ? t`No` : undefined,
            buttonPositive: t`Okay`,
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          notifySettings.authorizationStatus = AuthorizationStatus.AUTHORIZED;
        }
      }
      if (notifySettings.authorizationStatus === AuthorizationStatus.DENIED) {
        Alert.alert(
          t`Notifications Permission`,
          t`Right now, the app does not have sufficient permissions to show notifications properly, to do so you must allow notifications permission.`,
          [
            {
              text: t`Don't ask again`,
              style: 'destructive',
              onPress: () =>
                settings.setState({DONT_ASK_PERMISSION_NOTIFICATIONS: true}),
            },
            {
              text: t`Not now`,
              style: 'cancel',
            },
            {
              text: t`Show settings`,
              style: 'default',
              onPress: () => notifee.openNotificationSettings(),
            },
          ],
          {
            cancelable: true,
          },
        );
      }
    }
    if (
      !settings.getState().DONT_ASK_PERMISSION_ALARM &&
      notifySettings.android.alarm === AndroidNotificationSetting.DISABLED
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
}

async function askPhoneStatePermission() {
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
    {
      title: t`Phone State Permission`,
      message: t`To stop playing adhan when you receive a call, we need to read your phone state. not allowing this permission simply disables the feature.`,
      buttonNegative: Platform.Version <= 30 ? t`No` : undefined,
      buttonPositive: t`Okay`,
    },
  );

  if (
    result !== PermissionsAndroid.RESULTS.GRANTED &&
    !settings.getState().DONT_ASK_PERMISSION_PHONE_STATE
  ) {
    Alert.alert(
      t`Warning`,
      t`Without phone state permission, we won't be able to stop playing adhan during a call!`,
      [
        {
          text: t`Don't show again`,
          style: 'destructive',
          onPress: () =>
            settings.setState({DONT_ASK_PERMISSION_PHONE_STATE: true}),
        },
        {
          text: t`Show settings`,
          style: 'default',
          onPress: () => openApplicationSettings(),
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
  await askPhoneStatePermission();
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
