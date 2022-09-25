import {defer} from '@xutl/defer';
import SystemSetting from 'react-native-system-setting';
import MediaPlayer from '@/modules/media_player';

/** @returns {boolean} - true if played successfully, false otherwise */
export async function play(uri: string | number) {
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

  const endSub = MediaPlayer.addEventListener('completed', () => {
    endSub.remove();
    console.log('MediaPlayer completed');
    onFinally(false);
  });
  const errorSub = MediaPlayer.addEventListener('error', err => {
    errorSub.remove();
    console.error('MediaPlayer Error: ', err);
    onFinally(true);
  });

  await MediaPlayer.setDataSource({uri});

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
