import {t} from '@lingui/macro';
import {FormControl, IFormControlProps, Button} from 'native-base';
import {useCallback} from 'react';
import {saveJsonDocument} from '@/modules/activity';
import {storage} from '@/store/mmkv';

export function ExportSettings(props: IFormControlProps) {
  const exportSettings = useCallback(() => {
    const keys: string[] = storage.getAllKeys();
    let data: Record<string, string | undefined> = {};
    for (const key of keys) {
      if (key.endsWith('STORAGE')) {
        const str = storage.getString(key);
        if (str) {
          data[key] = JSON.parse(str);
        }
      }
    }
    const jsonData = JSON.stringify(data);
    saveJsonDocument(jsonData, 'al_azan_settings.json');
  }, []);

  return (
    <FormControl fontSize="md" {...props}>
      <FormControl.Label>{t`Export app data`}</FormControl.Label>
      <Button mb="1" onPress={exportSettings}>{t`Export data`}</Button>
      <FormControl.HelperText>{t`Custom sounds and muezzins will not be exported`}</FormControl.HelperText>
    </FormControl>
  );
}
