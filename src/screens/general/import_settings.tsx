import {t} from '@lingui/macro';
import {FormControl, IFormControlProps, Button} from 'native-base';
import {useCallback} from 'react';
// eslint-disable-next-line import/no-named-as-default
import {ToastAndroid} from 'react-native';
import {pickSingle} from 'react-native-document-picker';
import {FileSystem} from 'react-native-file-access';
import {loadLocale} from '@/i18n';
import {restart} from '@/modules/activity';
import {storage} from '@/store/mmkv';
import {SettingsStore, SETTINGS_STORAGE_KEY} from '@/store/settings';

export function ImportSettings(props: IFormControlProps) {
  const importSettings = useCallback(async () => {
    try {
      const pickResponse = await pickSingle();
      const fileData = await FileSystem.readFile(pickResponse.uri, 'utf8');
      const data = JSON.parse(fileData);
      let foundLocale: string = '';
      for (const [key, value] of Object.entries(data)) {
        if (key === SETTINGS_STORAGE_KEY) {
          foundLocale = (value as SettingsStore).SELECTED_LOCALE;
        }
        storage.set(key, JSON.stringify(value));
      }
      if (foundLocale) {
        loadLocale(foundLocale);
      }
      ToastAndroid.show(t`Import successful`, ToastAndroid.SHORT);
      setTimeout(restart, 200);
    } catch (e: any) {
      if (!e?.message?.includes('canceled')) {
        ToastAndroid.show(t`Failed to open file`, ToastAndroid.SHORT);
      }
    }
  }, []);

  return (
    <FormControl fontSize="md" {...props}>
      <FormControl.Label>{t`Import data`}</FormControl.Label>
      <Button onPress={importSettings}>{t`Import`}</Button>
    </FormControl>
  );
}
