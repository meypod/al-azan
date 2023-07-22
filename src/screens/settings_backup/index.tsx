import {Stack} from 'native-base';
import {ExportSettings} from './export_settings';
import {ImportSettings} from './import_settings';

export function BackupSettings() {
  return (
    <Stack safeArea p="3">
      <ImportSettings mb="4" />
      <ExportSettings mb="4" />
    </Stack>
  );
}
