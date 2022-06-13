import {defer} from '@xutl/defer';
import {exists} from 'react-native-fs';
import SystemSetting from 'react-native-system-setting';
import TrackPlayer, {Event, RepeatMode} from 'react-native-track-player';
import {ADHAN_FILE_LOCATION} from '@/constants/settings';
import {getSettings} from '@/store/settings';
import {SetAlarmTaskOptions} from '@/tasks/set_alarm';

const defaultAdhanSound = require('@/assets/sounds/masjid_an_nabawi.mp3');

// TODO: add adhan file option to alarm options
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function playAdhan(options: SetAlarmTaskOptions) {
  const volumeListener = SystemSetting.addVolumeListener(data => {
    TrackPlayer.setVolume(data.value);
  });

  const settings = await getSettings();

  if (settings.get(ADHAN_FILE_LOCATION)) {
    if (await exists(settings.get(ADHAN_FILE_LOCATION))) {
      TrackPlayer.add({
        url: settings.get(ADHAN_FILE_LOCATION),
      });
    } else {
      console.error(
        'azan_service: ',
        new Error(
          'Azan Service: File at specified location not found: ' +
            settings.get(ADHAN_FILE_LOCATION),
        ),
      );
      return;
    }
  } else {
    TrackPlayer.add({
      url: defaultAdhanSound,
    });
  }

  await TrackPlayer.setupPlayer();
  await TrackPlayer.reset();
  await TrackPlayer.updateOptions({
    stopWithApp: true,
    alwaysPauseOnInterruption: true,
  });
  await TrackPlayer.setVolume(await SystemSetting.getVolume());
  await TrackPlayer.setRepeatMode(RepeatMode.Off);

  const playbackFinishedDefer = defer<void>();

  const endSub = TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {
    endSub.remove();
    volumeListener.remove();
    playbackFinishedDefer.resolve();
  });
  const errorSub = TrackPlayer.addEventListener(Event.PlaybackError, err => {
    errorSub.remove();
    volumeListener.remove();
    playbackFinishedDefer.resolve();
    console.error('TrackPlayer Error: ', err);
  });

  await TrackPlayer.play();
  await playbackFinishedDefer;
}

export async function stopAdhan() {
  await TrackPlayer.stop();
  TrackPlayer.destroy();
}
