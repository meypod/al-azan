import {defer} from '@xutl/defer';
import SystemSetting from 'react-native-system-setting';
import MediaPlayer, {AudioEntry} from '@/modules/media_player';

/** returns `true` if interrupted during play, `false` otherwise */
export async function play(audioEntry: AudioEntry) {
  const volumeListener = SystemSetting.addVolumeListener(data => {
    MediaPlayer.setVolume(data.value);
  });

  try {
    await MediaPlayer.setupPlayer();
  } catch (e) {
    console.error(e);
  }

  const playbackFinishedDefer = defer<boolean>();

  const onFinally = (errored: boolean) => {
    volumeListener.remove();
    playbackFinishedDefer.resolve(errored);
  };

  const endSub = MediaPlayer.addEventListener(
    'completed',
    (interrupted: boolean) => {
      endSub.remove();
      console.log('MediaPlayer completed, Interrupted? ', interrupted);
      onFinally(interrupted);
    },
  );
  const errorSub = MediaPlayer.addEventListener('error', err => {
    errorSub.remove();
    console.error('MediaPlayer Error: ', err);
    onFinally(true);
  });

  await MediaPlayer.setDataSource({
    uri: audioEntry.filepath,
    loop: !!audioEntry.loop,
  });

  await MediaPlayer.start();
  const playbackResult = await playbackFinishedDefer;
  return playbackResult;
}

export function stop() {
  return MediaPlayer.stop();
}

export function destroy() {
  return MediaPlayer.destroy();
}
