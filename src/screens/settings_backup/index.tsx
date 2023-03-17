import {Box} from 'native-base';
import {ExportSettings} from './export_settings';
import {ImportSettings} from './import_settings';

export function BackupSettings() {
  return (
    <Box safeArea p="3">
      <ImportSettings mb="4" />
      <ExportSettings mb="4" />
    </Box>
  );
}
