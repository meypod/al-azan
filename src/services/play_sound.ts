import {defer} from '@xutl/defer';
import SystemSetting from 'react-native-system-setting';
import TrackPlayer, {Event, RepeatMode} from 'react-native-track-player';

export async function play(url: string | number) {
  const volumeListener = SystemSetting.addVolumeListener(data => {
    TrackPlayer.setVolume(data.value);
  });

  await TrackPlayer.setupPlayer();
  await TrackPlayer.reset();
  await TrackPlayer.add({
    url,
  });
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

export async function stop() {
  await TrackPlayer.stop();
}

export function destroy() {
  TrackPlayer.destroy();
}
