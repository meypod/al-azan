import {t} from '@lingui/macro';
import {HStack, FormControl} from 'native-base';
import {useCallback} from 'react';
import {AudioPicker} from './audio_picker';
import {Prayer, translatePrayer} from '@/adhan';
import {AudioEntry} from '@/modules/media_player';
import {SettingsStore} from '@/store/settings';

export default function PrayerAdhan({
  prayer,
  selectedEntry,
  setSelectedAdhan,
}: {
  prayer: Prayer;
  setSelectedAdhan: SettingsStore['setSelectedAdhan'];
  selectedEntry: AudioEntry | undefined;
}) {
  const onAudioSelected = useCallback(
    (item: AudioEntry) => setSelectedAdhan(prayer, item),
    [prayer, setSelectedAdhan],
  );

  return (
    <HStack alignItems="center" mb="1">
      <FormControl>
        <FormControl.Label>{translatePrayer(prayer)}</FormControl.Label>
        <AudioPicker
          actionsheetLabel={t({
            id: 'muezzin_settings',
            message: 'Muezzin',
          })}
          onItemSelected={onAudioSelected}
          getOptionLabel={item => item.label}
          autoCompleteKeys={['label']}
          selectedItem={selectedEntry}
          size="sm"
          height="10"
          adhan
        />
      </FormControl>
    </HStack>
  );
}
