import {t} from '@lingui/macro';

const RemoteBaseURI = 'https://github.com/meypod/audio_files/raw/main/adhan/';

export type AdhanEntry = {
  id: string;
  filepath?: string | number;
  label: string;
  remoteUri?: string;
  canDelete?: boolean;
};

export const defautlAdhanAssetId = require('@/assets/sounds/masjid_an_nabawi.mp3');

export const INITIAL_ADHAN_AUDIO_ENTRIES: AdhanEntry[] = [
  {
    id: 'masjid_an_nabawi',
    filepath: defautlAdhanAssetId,
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
