import {defer} from '@xutl/defer';
import SystemSetting from 'react-native-system-setting';
import TrackPlayer, {Event, RepeatMode} from 'react-native-track-player';
import {isCallActive} from '@/utils/call_state';

/** @returns {boolean} - true if played successfully, false otherwise */
export async function play(url: string | number) {
  if (await isCallActive()) {
    return Promise.resolve(false);
  }

  const adhanVolume = await SystemSetting.getVolume();

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
  await TrackPlayer.setVolume(adhanVolume);
  await TrackPlayer.setRepeatMode(RepeatMode.Off);

  const playbackFinishedDefer = defer<boolean>();

  const onFinally = (errored: boolean) => {
    interruptSub.remove();
    volumeListener.remove();
    playbackFinishedDefer.resolve(errored);
  };

  const endSub = TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {
    endSub.remove();
    onFinally(false);
  });
  const errorSub = TrackPlayer.addEventListener(Event.PlaybackError, err => {
    errorSub.remove();
    onFinally(true);
    console.error('TrackPlayer Error: ', err);
  });

  await TrackPlayer.play();
  const playbackResult = await playbackFinishedDefer;

  return playbackResult;
}

export async function stop() {
  await TrackPlayer.stop();
}

export function destroy() {
  TrackPlayer.destroy();
}
