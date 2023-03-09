import {t} from '@lingui/macro';
import {Alert} from 'react-native';

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
