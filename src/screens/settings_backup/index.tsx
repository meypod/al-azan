import {t} from '@lingui/macro';
import {FormControl, Stack} from 'native-base';
import {ExportSettings} from './export_settings';
import {ImportSettings} from './import_settings';
import {SafeArea} from '@/components/safe_area';

export function BackupSettings() {
  return (
    <SafeArea>
      <Stack p="3">
        <FormControl fontSize="md" mb="4">
          <FormControl.Label>{t`Import app data`}</FormControl.Label>
          <ImportSettings />
        </FormControl>

        <ExportSettings mb="4" />
      </Stack>
    </SafeArea>
  );
}
