import {Box} from 'native-base';
import {ExportSettings} from './export_settings';
import {ImportSettings} from './import_settings';
import {VolumeButtonSetting} from './volume_button_setting';

export function GeneralSettings() {
  return (
    <Box safeArea p="3">
      <VolumeButtonSetting mb="8" />
      <ImportSettings mb="4" />
      <ExportSettings mb="4" />
    </Box>
  );
}
