import {AdhanAudioEntry} from '@/assets/adhan_entries';
import {SELECTED_ADHAN_ENTRY} from '@/constants/settings';
import {destroy, play, stop} from '@/services/play_sound';
import {getSettings} from '@/store/settings';

const defaultAdhanSound = require('@/assets/sounds/masjid_an_nabawi.mp3');

export async function playAdhan() {
  const settings = await getSettings();

  let adhanFilePath: string | number =
    settings.get<AdhanAudioEntry>(SELECTED_ADHAN_ENTRY)?.filepath ||
    defaultAdhanSound;

  await play(adhanFilePath);
}

export async function stopAdhan() {
  await stop();
  destroy();
}
