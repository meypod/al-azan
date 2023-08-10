import {t} from '@lingui/macro';
import notifee from '@notifee/react-native';
import {Alert} from 'react-native';
import {isLocationEnabled, openLocationSettings} from '@/modules/activity';

export function showDeleteDialog(itemName?: string) {
  return new Promise(resolve => {
    Alert.alert(
      t`Delete`,
      itemName
        ? t`Are you sure you want to delete "${itemName}" ?`
        : t`Are you sure you want to delete this?`,
      [
        {
          text: t`No`,
          style: 'cancel',
          onPress: () => resolve(false),
        },
        {
          text: t`Yes`,
          onPress: () => {
            resolve(true);
          },
          style: 'destructive',
        },
      ],
    );
  });
}

export async function askForLocationService(message?: string) {
  const locationEnabled = await isLocationEnabled();
  if (!locationEnabled) {
    return await new Promise(resolve => {
      Alert.alert(
        t`Location`,
        message ? message : t`Please enable location service`,
        [
          {
            text: t`Okay`,
            style: 'cancel',
            onPress: () => isLocationEnabled().then(resolve),
          },
          {
            text: t`Location settings`,
            onPress: () => {
              openLocationSettings().then(resolve);
            },
            style: 'default',
          },
        ],
      );
    });
  } else {
    return locationEnabled;
  }
}

export function showBatteryOptimizationReminder() {
  return new Promise(resolve => {
    Alert.alert(
      t`Reminder`,
      t`It seems that you have imported a backup, don't forget to disable battery optimizations for this app`,
      [
        {
          text: t`Show me`,
          style: 'default',
          onPress: () =>
            notifee.openBatteryOptimizationSettings().then(resolve),
          isPreferred: true,
        },
        {
          text: t`Dismiss`,
          style: 'cancel',
          onPress: () => resolve(undefined),
        },
      ],
    );
  });
}
