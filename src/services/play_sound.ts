import {defer} from '@xutl/defer';
import SystemSetting from 'react-native-system-setting';
import MediaPlayer, {AudioEntry} from '@/modules/media_player';

/** returns `true` if interrupted during play, `false` otherwise */
export async function play({
  audioEntry,
  volumeBtnInterrupts,
}: {
  audioEntry: AudioEntry;
  volumeBtnInterrupts?: boolean;
}) {
  try {
    await MediaPlayer.setupPlayer();
  } catch (e) {
    console.error(e);
  }

  const playbackFinishedDefer = defer<boolean>();

  const onFinally = (errored: boolean) => {
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
  const volumeListener = SystemSetting.addVolumeListener(data => {
    if (volumeBtnInterrupts) {
      stop();
    } else {
      MediaPlayer.setVolume(data.value);
    }
  });

  const removeListeners = () => {
    volumeListener.remove();
    endSub.remove();
    errorSub.remove();
  };

  try {
    await MediaPlayer.setDataSource({
      uri: audioEntry.filepath,
      loop: !!audioEntry.loop,
    });
    await MediaPlayer.start();
    const playbackResult = await playbackFinishedDefer;
    return playbackResult;
  } catch (e) {
    onFinally(true); // to resolve the pending promise
    return true; // interrupted or errored
  } finally {
    removeListeners();
  }
}

export function stop() {
  return MediaPlayer.stop();
}

export function destroy() {
  return MediaPlayer.destroy();
}
