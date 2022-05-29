import SystemSetting from 'react-native-system-setting';
import TrackPlayer, {Event, RepeatMode} from 'react-native-track-player';
import {SetAlarmTaskOptions} from '@/tasks/set_alarm';

// TODO: add adhan file option to alarm options
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function playAdhan(options: SetAlarmTaskOptions) {
  const volumeListener = SystemSetting.addVolumeListener(data => {
    TrackPlayer.setVolume(data.value);
  });

  return new Promise<void>(resolve => {
    return TrackPlayer.setupPlayer()
      .then(() =>
        TrackPlayer.updateOptions({
          stopWithApp: true,
          alwaysPauseOnInterruption: true,
        }),
      )
      .then(() =>
        SystemSetting.getVolume().then(volume => {
          return TrackPlayer.setVolume(volume);
        }),
      )
      .then(() => TrackPlayer.setRepeatMode(RepeatMode.Off))
      .then(() => TrackPlayer.reset())
      .then(() =>
        TrackPlayer.add({
          url: require('@/assets/sounds/adhan.mp3'),
        }),
      )
      .then(() => {
        const endSub = TrackPlayer.addEventListener(
          Event.PlaybackQueueEnded,
          () => {
            endSub.remove();
            volumeListener.remove();
            resolve();
          },
        );
        const errorSub = TrackPlayer.addEventListener(
          Event.PlaybackError,
          err => {
            errorSub.remove();
            volumeListener.remove();
            resolve();
            console.error('TrackPlayer Error: ', err);
          },
        );
      })
      .then(() => TrackPlayer.play())
      .catch(() => {
        volumeListener.remove();
        resolve();
      });
  });
}

export async function stopAdhan() {
  await TrackPlayer.stop();
  TrackPlayer.destroy();
}
