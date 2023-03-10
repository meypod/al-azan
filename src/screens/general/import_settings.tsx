import {t} from '@lingui/macro';
import {FormControl, IFormControlProps, Button} from 'native-base';
import {useCallback} from 'react';
// eslint-disable-next-line import/no-named-as-default
import {ToastAndroid} from 'react-native';
import {pickSingle} from 'react-native-document-picker';
import {FileSystem} from 'react-native-file-access';
import {INITIAL_ADHAN_AUDIO_ENTRIES} from '@/assets/adhan_entries';
import {loadLocale} from '@/i18n';
import {restart} from '@/modules/activity';
import {storage} from '@/store/mmkv';
import {ReminderStore, REMINDER_STORAGE_KEY} from '@/store/reminder';
import {SettingsStore, SETTINGS_STORAGE_KEY} from '@/store/settings';

export function ImportSettings(props: IFormControlProps) {
  const importSettings = useCallback(async () => {
    try {
      const pickResponse = await pickSingle();
      const fileData = await FileSystem.readFile(pickResponse.uri, 'utf8');
      const data = JSON.parse(fileData) as Record<string, {state: unknown}>;
      let foundLocale: string = '';
      for (const [key, value] of Object.entries(data)) {
        if (key === SETTINGS_STORAGE_KEY) {
          const store = value.state as SettingsStore;
          foundLocale = store.SELECTED_LOCALE;
          store.SAVED_ADHAN_AUDIO_ENTRIES = INITIAL_ADHAN_AUDIO_ENTRIES;
          store.SAVED_USER_AUDIO_ENTRIES = [];
          store.SELECTED_ADHAN_ENTRY = INITIAL_ADHAN_AUDIO_ENTRIES[0];
          store.SELECTED_FAJR_ADHAN_ENTRY = undefined;
        } else if (key === REMINDER_STORAGE_KEY) {
          const store = value.state as ReminderStore;
          for (const reminder of store.REMINDERS) {
            if (
              reminder.sound?.id &&
              !['default', 'silent', 'masjid_an_nabawi'].includes(
                reminder.sound.id,
              )
            ) {
              reminder.sound.id = 'default';
              reminder.sound.label = t`Default` + ` (${t`Notification`})`;
              reminder.sound.filepath = null as unknown as number; // just a trick, default is a special case
              reminder.sound.notif = true;
            }
          }
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
        console.error(e);
        ToastAndroid.show(t`Error: failed to open file`, ToastAndroid.SHORT);
      }
    }
  }, []);

  return (
    <FormControl fontSize="md" {...props}>
      <FormControl.Label>{t`Import app data`}</FormControl.Label>
      <Button onPress={importSettings}>{t`Import`}</Button>
    </FormControl>
  );
}
