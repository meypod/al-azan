import {Prayer} from '@/adhan';
import {defautlAdhanAssetId} from '@/assets/adhan_entries';
import {destroy, play, stop} from '@/services/play_sound';
import {settings} from '@/store/settings';

export async function playAdhan(prayer: Prayer) {
  let adhanFilePath: string | number = defautlAdhanAssetId;

  {
    const settingsState = settings.getState();
    if (
      prayer === Prayer.Fajr &&
      settingsState.SELECTED_FAJR_ADHAN_ENTRY?.filepath
    ) {
      adhanFilePath = settingsState.SELECTED_FAJR_ADHAN_ENTRY.filepath;
    } else {
      adhanFilePath =
        settingsState.SELECTED_ADHAN_ENTRY?.filepath || adhanFilePath;
    }
  }

  await play(adhanFilePath);

  return destroy();
}

export async function stopAdhan() {
  await stop();
  await destroy();
}
