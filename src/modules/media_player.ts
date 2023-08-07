import {useEffect, useState} from 'react';
import {
  NativeModules,
  NativeEventEmitter,
  Image,
  Platform,
  AppRegistry,
} from 'react-native';

const MediaPlayerModule = (
  NativeModules.MediaPlayerModule
    ? NativeModules.MediaPlayerModule
    : new Proxy(
        {},
        {
          get() {
            // @ts-ignore
            if (process?.env?.JEST_WORKER_ID === undefined) {
              throw new Error('error while linking media player module');
            }
          },
        },
      )
) as MediaPlayerModuleInterface;

const eventEmitter = new NativeEventEmitter(MediaPlayerModule);

export enum PlaybackState {
  'started' = 'started',
  'stopped' = 'stopped',
  'paused' = 'paused',
}

export type AudioEntry = {
  id: string;
  filepath: string | number;
  label: string;
  canDelete?: boolean;
  loop?: boolean;
  notif?: boolean;
};

export function isSilent(entry: AudioEntry | undefined) {
  if (!entry) return true;
  if (entry.id === 'silent') return true;
  return false;
}

export function isIntrusive(entry: AudioEntry | undefined) {
  return !isSilent(entry) && !entry?.notif;
}

export type SetDataSourceOptions = {
  uri: string | number;
  loop: boolean;
  preferExternalDevice?: boolean;
};

interface MediaPlayerModuleInterface {
  start(): Promise<void>;
  stop(): Promise<void>;
  pause(): Promise<void>;
  setupPlayer(): Promise<void>;
  destroy(): Promise<void>;
  setVolume(value: number): Promise<void>;
  setDataSource(options?: SetDataSourceOptions): Promise<void>;
  getState(): Promise<PlaybackState>;
  getRingtones(): Promise<AudioEntry[]>;
  addListener(eventName: string): void;
  removeListeners(count: Number): void;
}

type EventListener = (
  eventType: 'error' | 'completed' | 'state' | 'audio_focus_change',
  listener: (event: any) => void,
) => ReturnType<typeof eventEmitter.addListener>;

const start = MediaPlayerModule.start;
const stop = MediaPlayerModule.stop;
const pause = MediaPlayerModule.pause;
const setupPlayer = MediaPlayerModule.setupPlayer;
const destroy = MediaPlayerModule.destroy;
const setVolume = MediaPlayerModule.setVolume;
const setDataSource = async (options: SetDataSourceOptions) => {
  let {uri, loop, preferExternalDevice = false} = options;
  if (typeof options.uri === 'number') {
    const resolved = Image.resolveAssetSource(options.uri);
    uri = resolved.uri;
  }
  return MediaPlayerModule.setDataSource({uri, loop, preferExternalDevice});
};
const getState = MediaPlayerModule.getState;
const addEventListener = eventEmitter.addListener.bind(
  eventEmitter,
) as EventListener;

export const getRingtones = MediaPlayerModule.getRingtones;

export const usePlaybackState = () => {
  const [state, setState] = useState(PlaybackState.stopped);
  useEffect(() => {
    let unmounted = false;
    // Set initial state
    getState().then(playerState => {
      // If the component has been unmounted, exit
      if (unmounted) return;
      setState(playerState);
    });

    const sub = addEventListener('state', s => {
      setState(s);
    });

    return () => {
      unmounted = true;
      sub.remove();
    };
  }, []);

  return state;
};

let volumePressHandler: (() => Promise<void>) | undefined;

if (Platform.OS === 'android') {
  AppRegistry.registerHeadlessTask('volume_btn_pressed', () => {
    // silently ignore volume pressed if there's no handler
    return () => {
      return volumePressHandler ? volumePressHandler() : Promise.resolve();
    };
  });
}

export const onVolumeBtnPressed = (handler: typeof volumePressHandler) => {
  volumePressHandler = handler;
};

export default {
  start,
  stop,
  pause,
  setupPlayer,
  destroy,
  setVolume,
  setDataSource,
  addEventListener,
  eventEmitter,
  usePlaybackState,
  PlaybackState,
  getRingtones,
};
