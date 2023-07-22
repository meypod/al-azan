import {Stack} from 'native-base';
import {ExportSettings} from './export_settings';
import {ImportSettings} from './import_settings';
import {SafeArea} from '@/components/safe_area';

export function BackupSettings() {
  return (
    <SafeArea>
      <Stack p="3">
        <ImportSettings mb="4" />
        <ExportSettings mb="4" />
      </Stack>
    </SafeArea>
  );
}
