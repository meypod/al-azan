import {t} from '@lingui/macro';
import {Button, HStack, VStack, Text, Progress, Pressable} from 'native-base';
import {useState} from 'react';
import {ToastAndroid} from 'react-native';
import ReactNativeBlobUtil, {
  FetchBlobResponse,
  StatefulPromise,
  // eslint-disable-next-line
} from 'react-native-blob-util';
import {State} from 'react-native-track-player';
import {AdhanEntry, saveAdhanEntry} from '@/assets/adhan_entries';
import {CheckIcon} from '@/assets/icons/check';
import {CloseIcon} from '@/assets/icons/close';
import {DownloadIcon} from '@/assets/icons/download';
import {PlayIcon} from '@/assets/icons/play';
import {StopIcon} from '@/assets/icons/stop';

export type AdhanListItemProps = {
  item: AdhanEntry;
  selected_item_id?: string;
  playing_item_id?: string;
  playerState: State | null;
  playAdhanEntry: (entry: AdhanEntry) => void;
  onPress: () => void;
};

export function AdhanListItem({
  item,
  selected_item_id,
  playing_item_id,
  playerState,
  playAdhanEntry,
  onPress,
}: AdhanListItemProps) {
  const [dlProgress, setDlProgress] = useState<number | null>(null);
  const [dlTask, setDlTask] =
    useState<StatefulPromise<FetchBlobResponse> | null>(null);

  const toggleDownload = (uri: string) => {
    if (dlTask !== null) {
      dlTask.cancel();
      return;
    }
    setDlProgress(0);
    const task = ReactNativeBlobUtil.config({
      path: ReactNativeBlobUtil.fs.dirs.DocumentDir + '/' + item.id + '.mp3',
    }).fetch('GET', uri, {
      'Content-Type': 'octet-stream',
    });

    setDlTask(task);

    task
      .progress((received, total) => {
        setDlProgress((received / total) * 100);
      })
      .then(resp => {
        return saveAdhanEntry({
          ...item,
          filepath: resp.path(),
        });
      })
      .catch((err: Error) => {
        console.error(err);
        if (!err?.message.includes('cancel')) {
          ToastAndroid.show(
            t`Error while downloading audio`,
            ToastAndroid.SHORT,
          );
        }
      })
      .finally(() => {
        setDlTask(null);
        setDlProgress(null);
      });
  };

  return (
    <Pressable onPress={onPress}>
      {({isPressed}) => (
        <VStack
          bgColor={
            item.id === selected_item_id
              ? 'coolGray.300:alpha.30'
              : isPressed
              ? 'coolGray.300:alpha.10'
              : undefined
          }>
          <HStack p="1" alignItems="center" justifyContent="space-between">
            <HStack alignItems="center">
              <CheckIcon
                mx="2"
                size="xl"
                color={
                  item.id === selected_item_id ? 'green.500' : 'transparent'
                }
              />
              <Text>{item.label}</Text>
            </HStack>

            <HStack alignItems="center">
              {item?.filepath && (
                <Button
                  onPress={() => playAdhanEntry(item)}
                  p="2"
                  variant="ghost">
                  {item.id === playing_item_id &&
                  playerState === State.Playing ? (
                    <StopIcon size="xl" />
                  ) : (
                    <PlayIcon size="xl" />
                  )}
                </Button>
              )}

              {!item?.filepath && item.remoteUri && (
                <Button
                  onPress={() => toggleDownload(item.remoteUri!)}
                  p="2"
                  variant="ghost">
                  {dlTask !== null ? (
                    <CloseIcon size="xl" />
                  ) : (
                    <DownloadIcon size="xl" />
                  )}
                </Button>
              )}
            </HStack>
          </HStack>
          {dlTask !== null && <Progress value={dlProgress || 0} size="xs" />}
        </VStack>
      )}
    </Pressable>
  );
}
