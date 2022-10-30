import {t} from '@lingui/macro';
import {
  Button,
  HStack,
  VStack,
  Text,
  Progress,
  Pressable,
  Menu,
} from 'native-base';
import {useCallback, useState} from 'react';
import {Alert, ToastAndroid} from 'react-native';
import ReactNativeBlobUtil, {
  FetchBlobResponse,
  StatefulPromise,
  // eslint-disable-next-line
} from 'react-native-blob-util';
import {AdhanEntry} from '@/assets/adhan_entries';
import {CheckIcon} from '@/assets/icons/check';
import {CloseIcon} from '@/assets/icons/close';
import {DownloadIcon} from '@/assets/icons/download';
import {MoreVertIcon} from '@/assets/icons/more_vert';
import {PlayIcon} from '@/assets/icons/play';
import {StopIcon} from '@/assets/icons/stop';
import {PlaybackState} from '@/modules/media_player';
import {settings} from '@/store/settings';

export type AdhanListItemProps = {
  item: AdhanEntry;
  selected_item_id?: string;
  selected_fajr_item_id?: string;
  playing_item_id?: string;
  playerState: PlaybackState | null;
  playAdhanEntry: (entry: AdhanEntry) => void;
  onAdhanSelected: (item: AdhanEntry) => void;
  onFajrAdhanSelected: (item: AdhanEntry | undefined) => void;
};

export function AdhanListItem({
  item,
  selected_item_id,
  selected_fajr_item_id,
  playing_item_id,
  playerState,
  playAdhanEntry,
  onAdhanSelected,
  onFajrAdhanSelected,
}: AdhanListItemProps) {
  const [dlProgress, setDlProgress] = useState<number | null>(null);
  const [dlTask, setDlTask] =
    useState<StatefulPromise<FetchBlobResponse> | null>(null);

  const toggleDownload = useCallback(
    (uri: string) => {
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
    },
    [dlTask, item],
  );

  const onDeletePressed = useCallback(() => {
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
  }, [item]);

  const onPressed = useCallback(() => {
    onAdhanSelected(item);
  }, [item, onAdhanSelected]);

  const isCurrentlyPlaying = item.id === playing_item_id;
  const isSelectedAsAdhan = item.id === selected_item_id;
  const isSelectedAsFajrAdhan = item.id === selected_fajr_item_id;

  const onFajrToggle = useCallback(() => {
    if (isSelectedAsFajrAdhan) {
      onFajrAdhanSelected(undefined);
    } else {
      onFajrAdhanSelected(item);
    }
  }, [item, onFajrAdhanSelected, isSelectedAsFajrAdhan]);

  return (
    <Pressable onPress={onPressed}>
      {({isPressed}) => (
        <VStack
          bgColor={
            isSelectedAsAdhan
              ? 'coolGray.300:alpha.30'
              : isPressed
              ? 'coolGray.300:alpha.10'
              : undefined
          }>
          <HStack p="1">
            <HStack flex={1} alignItems="center">
              <CheckIcon
                mr="1"
                size="md"
                color={isSelectedAsAdhan ? 'green.500' : 'transparent'}
              />
              {isSelectedAsFajrAdhan && (
                <CheckIcon
                  mr="1"
                  size="md"
                  color={isSelectedAsFajrAdhan ? 'primary.500' : 'transparent'}
                />
              )}
              <Text flex={1} flexGrow={1} noOfLines={1}>
                {item.label}
              </Text>
            </HStack>

            <HStack flexShrink={0} flexGrow={0} alignItems="center">
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
              {item?.filepath && (
                <Menu
                  trigger={triggerProps => {
                    return (
                      <Pressable
                        accessibilityLabel={t`Show Adhan Options`}
                        {...triggerProps}
                        p="2">
                        <MoreVertIcon size="2xl" />
                      </Pressable>
                    );
                  }}>
                  <Menu.Item onPress={onFajrToggle}>
                    {isSelectedAsFajrAdhan
                      ? t`Deselect as Fajr Adhan`
                      : t`Select as Fajr Adhan`}
                  </Menu.Item>
                  {item?.canDelete && (
                    <Menu.Item onPress={onDeletePressed}>
                      <Text color="red.400">{t`Delete`}</Text>
                    </Menu.Item>
                  )}
                </Menu>
              )}
              {item?.filepath && (
                <Button
                  onPress={() => playAdhanEntry(item)}
                  p="2"
                  variant="ghost">
                  {isCurrentlyPlaying &&
                  playerState === PlaybackState.started ? (
                    <StopIcon size="xl" />
                  ) : (
                    <PlayIcon size="xl" />
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
