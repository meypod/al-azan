import {AudioEntry} from '@/modules/media_player';
import {destroy, play, stop} from '@/services/play_sound';
import {settings} from '@/store/settings';

/** returns `true` if interrupted during play, `false` otherwise */
export async function playAudio(audio: AudioEntry) {
  const settingsState = settings.getState();

  if (settingsState.IS_PLAYING_AUDIO) {
    await stop();
  }
  settings.setState({IS_PLAYING_AUDIO: true});
  const result = await play({
    audioEntry: audio,
    volumeBtnInterrupts: settingsState.VOLUME_BUTTON_STOPS_ADHAN,
    preferExternalDevice: settingsState.PREFER_EXTERNAL_AUDIO_DEVICE,
  });
  settings.setState({IS_PLAYING_AUDIO: false});

  await destroy();
  return result;
}

export async function stopAudio() {
  await stop();
  settings.setState({IS_PLAYING_AUDIO: false});
  await destroy();
}
