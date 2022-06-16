import {destroy, play, stop} from '@/services/play_sound';
import {settings} from '@/store/settings';

const defaultAdhanSound = require('@/assets/sounds/masjid_an_nabawi.mp3');

export async function playAdhan() {
  let adhanFilePath: string | number =
    settings.getState()['SELECTED_ADHAN_ENTRY']?.filepath || defaultAdhanSound;

  await play(adhanFilePath);
}

export async function stopAdhan() {
  await stop();
  destroy();
}
