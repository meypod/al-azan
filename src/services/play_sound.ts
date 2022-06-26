import {defer} from '@xutl/defer';
import SystemSetting from 'react-native-system-setting';
import {isCallActive} from '@/modules/call_state';
import MediaPlayer from '@/modules/media_player';

/** @returns {boolean} - true if played successfully, false otherwise */
export async function play(uri: string | number) {
  if (await isCallActive()) {
    return Promise.resolve(false);
  }

  const volumeListener = SystemSetting.addVolumeListener(data => {
    MediaPlayer.setVolume(data.value);
  });

  await MediaPlayer.setupPlayer().catch(() => {});

  const playbackFinishedDefer = defer<boolean>();

  const onFinally = (errored: boolean) => {
    volumeListener.remove();
    playbackFinishedDefer.resolve(errored);
  };

  const endSub = MediaPlayer.addEventListener('completed', () => {
    endSub.remove();
    onFinally(false);
  });
  const errorSub = MediaPlayer.addEventListener('error', err => {
    errorSub.remove();
    onFinally(true);
    console.error('MediaPlayer Error: ', err);
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
