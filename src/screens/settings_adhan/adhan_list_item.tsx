import {t} from '@lingui/macro';
import {Button, HStack, VStack, Text, Progress, Pressable} from 'native-base';
import {useState} from 'react';
import {Alert, ToastAndroid} from 'react-native';
import ReactNativeBlobUtil, {
  FetchBlobResponse,
  StatefulPromise,
  // eslint-disable-next-line
} from 'react-native-blob-util';
import {AdhanEntry} from '@/assets/adhan_entries';
import {CheckIcon} from '@/assets/icons/check';
import {CloseIcon} from '@/assets/icons/close';
import {DeleteIcon} from '@/assets/icons/delete';
import {DownloadIcon} from '@/assets/icons/download';
import {PlayIcon} from '@/assets/icons/play';
import {StopIcon} from '@/assets/icons/stop';
import {PlaybackState} from '@/modules/media_player';
import {settings} from '@/store/settings';

export type AdhanListItemProps = {
  item: AdhanEntry;
  selected_item_id?: string;
  playing_item_id?: string;
  playerState: PlaybackState | null;
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
        return settings.getState().saveAdhanEntry({
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

  const onDeletePressed = () => {
    Alert.alert(
      t`Delete`,
      t`Are you sure you want to delete "${item.label}" ?`,
      [
        {
          text: t`No`,
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => settings.getState().deleteAdhanEntry(item),
          style: 'destructive',
        },
      ],
    );
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
          <HStack p="1">
            <HStack flex={1} alignItems="center">
              <CheckIcon
                mx="2"
                size="xl"
                color={
                  item.id === selected_item_id ? 'green.500' : 'transparent'
                }
              />
              <Text flex={1} flexGrow={1} noOfLines={1}>
                {item.label}
              </Text>
            </HStack>

            <HStack flexShrink={0} flexGrow={0} alignItems="center">
              {item?.canDelete && (
                <Button onPress={onDeletePressed} p="2" variant="ghost">
                  <DeleteIcon color="red.300" size="xl" />
                </Button>
              )}
              {item?.filepath && (
                <Button
                  onPress={() => playAdhanEntry(item)}
                  p="2"
                  variant="ghost">
                  {item.id === playing_item_id &&
                  playerState === PlaybackState.started ? (
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
