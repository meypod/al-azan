import {t} from '@lingui/macro';
import {produce} from 'immer';
import {HStack, FormControl} from 'native-base';
import {useCallback, useMemo} from 'react';
import {AudioPicker} from './audio_picker';
import {Prayer, translatePrayer} from '@/adhan';
import {adhanEntryTranslations} from '@/assets/adhan_entries';
import {i18n} from '@/i18n_base';
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

  const translatedSelectedItem = useMemo(() => {
    if (selectedEntry) {
      return produce(selectedEntry, (e: any) => {
        {
          if (e.internal) {
            e.label = i18n._(adhanEntryTranslations[e.id]);
          }
          (e as any).a = true;
        }
      });
    }
    return undefined;
  }, [selectedEntry]);

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
          autoCompleteKeys={['label']}
          selectedItem={translatedSelectedItem}
          size="sm"
          height="10"
          adhan
        />
      </FormControl>
    </HStack>
  );
}
