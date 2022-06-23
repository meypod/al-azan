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
    alwaysPauseOnInterruption: false,
  });
  const interruptSub = TrackPlayer.addEventListener(
    Event.RemoteDuck,
    async () => {
      // doesnt matter if `e.permanent` or `e.paused`, always stop playback
      await TrackPlayer.stop();
    },
  );
  await TrackPlayer.setVolume(await SystemSetting.getVolume());
  await TrackPlayer.setRepeatMode(RepeatMode.Off);

  const playbackFinishedDefer = defer<void>();

  const onFinally = () => {
    interruptSub.remove();
    volumeListener.remove();
    playbackFinishedDefer.resolve();
  };

  const endSub = TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {
    endSub.remove();
    onFinally();
  });
  const errorSub = TrackPlayer.addEventListener(Event.PlaybackError, err => {
    errorSub.remove();
    onFinally();
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
