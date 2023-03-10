import {Box} from 'native-base';
// import {ExportSettings} from './export_settings';
import {VolumeButtonSetting} from './volume_button_setting';

export function GeneralSettings() {
  return (
    <Box safeArea p="3">
      <VolumeButtonSetting mb="5" />
      {/* <ExportSettings mb="4" /> */}
    </Box>
  );
}
