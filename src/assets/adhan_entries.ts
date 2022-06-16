import {t} from '@lingui/macro';
import {Image} from 'react-native';
import {SAVED_ADHAN_AUDIO_ENTRIES} from '@/constants/settings';
import {getSettings, setSettings} from '@/store/settings';

const RemoteBaseURI = 'https://github.com/meypod/audio_files/raw/main/adhan/';

export type AdhanEntry = {
  id: string;
  filepath?: string | number;
  label: string;
  remoteUri?: string;
  canDelete?: boolean;
};

export async function saveAdhanEntry(entry: AdhanEntry) {
  const settings = await getSettings();
  const savedEntries = settings.get<AdhanEntry[]>(SAVED_ADHAN_AUDIO_ENTRIES);

  let fIndex = savedEntries.findIndex(e => e.id === entry.id);
  if (fIndex !== -1) {
    savedEntries.splice(fIndex, 1, entry);
  } else {
    savedEntries.push(entry);
  }

  settings.set(SAVED_ADHAN_AUDIO_ENTRIES, savedEntries);

  await setSettings(settings);
}

export const INITIAL_ADHAN_AUDIO_ENTRIES: AdhanEntry[] = [
  {
    id: 'masjid_an_nabawi',
    filepath: Image.resolveAssetSource(
      require('@/assets/sounds/masjid_an_nabawi.mp3'),
    ).uri,
    label: t`Masjid An Nabawi`,
  },
  {
    id: 'abdul_basit_abdus_samad',
    label: t`Abdul-Basit Abdus-Samad`,
    remoteUri: RemoteBaseURI + 'abdul_basit_abdus_samad.mp3',
  },
  {
    id: 'ragheb_mustafa_ghalwash',
    label: t`Ragheb Mustafa Ghalwash`,
    remoteUri: RemoteBaseURI + 'ragheb_mustafa_ghalwash.mp3',
  },
  {
    id: 'moazen_zade',
    label: t`Moazen Zade`,
    remoteUri: RemoteBaseURI + 'moazen_zade.mp3',
  },
];
