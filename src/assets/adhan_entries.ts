import {MessageDescriptor} from '@lingui/core';
import {defineMessage} from '@lingui/macro';

const RemoteBaseURI = 'https://github.com/meypod/audio_files/raw/main/adhan/';

export type AdhanEntry = {
  id: string;
  filepath?: string | number;
  label: string;
  remoteUri?: string;
  canDelete?: boolean;
  internal?: boolean;
};

export const defautlAdhanAssetId = require('@/assets/sounds/masjid_an_nabawi.mp3');

export const adhanEntryTranslations = {
  masjid_an_nabawi: defineMessage({
    id: 'masjid_an_nabawi',
    message: 'Masjid An Nabawi',
  }),
  abdul_basit_abdus_samad: defineMessage({
    id: 'abdul_basit_abdus_samad',
    message: 'Abdul-Basit Abdus-Samad',
  }),
  ragheb_mustafa_ghalwash: defineMessage({
    id: 'ragheb_mustafa_ghalwash',
    message: 'Ragheb Mustafa Ghalwash',
  }),
  moazen_zade: defineMessage({
    id: 'moazen_zade',
    message: 'Moazen Zade',
  }),
} as Record<string, MessageDescriptor>;

export const INITIAL_ADHAN_AUDIO_ENTRIES: AdhanEntry[] = [
  {
    id: 'masjid_an_nabawi',
    filepath: defautlAdhanAssetId,
    label: '',
    internal: true,
  },
  {
    id: 'abdul_basit_abdus_samad',
    remoteUri: RemoteBaseURI + 'abdul_basit_abdus_samad.mp3',
    label: '',
    internal: true,
  },
  {
    id: 'ragheb_mustafa_ghalwash',
    remoteUri: RemoteBaseURI + 'ragheb_mustafa_ghalwash.mp3',
    label: '',
    internal: true,
  },
  {
    id: 'moazen_zade',
    remoteUri: RemoteBaseURI + 'moazen_zade.mp3',
    label: '',
    internal: true,
  },
];
