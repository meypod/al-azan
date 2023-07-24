import {i18n} from '@lingui/core';
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
import {FileSystem, Dirs} from 'react-native-file-access';
import type {ManagedFetchResult} from 'react-native-file-access/lib/typescript/types';
import {AdhanEntry, adhanEntryTranslations} from '@/assets/adhan_entries';
import {CheckIcon} from '@/assets/icons/material_icons/check';
import {CloseIcon} from '@/assets/icons/material_icons/close';
import {DownloadIcon} from '@/assets/icons/material_icons/download';
import {MoreVertIcon} from '@/assets/icons/material_icons/more_vert';
import {PlayIcon} from '@/assets/icons/material_icons/play';
import {StopIcon} from '@/assets/icons/material_icons/stop';
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
  const [dlTask, setDlTask] = useState<ManagedFetchResult | null>(null);

  const toggleDownload = useCallback(
    (uri: string) => {
      if (dlTask !== null) {
        dlTask.cancel();
        return;
      }
      setDlProgress(0);
      const savePath = Dirs.DocumentDir + '/' + item.id + '.mp3';
      const task = FileSystem.fetchManaged(
        uri,
        {
          path: savePath,
          network: 'any',
          headers: {
            'Content-Type': 'octet-stream',
          },
        },
        (bytesRead, contentLength) => {
          setDlProgress((bytesRead / contentLength) * 100);
        },
      );

      task.result
        .then(() => {
          settings.getState().saveAdhanEntry({
            ...item,
            label: '',
            internal: true,
            filepath: savePath,
          });
        })
        .catch(err => {
          console.error(err);
          if (!err?.message.toLowerCase().includes('cancel')) {
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

      setDlTask(task);
    },
    [dlTask, item],
  );

  const onDeletePressed = useCallback(() => {
    Alert.alert(
      t`Delete`,
      t`Are you sure you want to delete "${
        item.internal ? i18n._(adhanEntryTranslations[item.id]) : item.label
      }" ?`,
      [
        {
          text: t`No`,
          style: 'cancel',
        },
        {
          text: t`Yes`,
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
                accessibilityLabel={
                  isSelectedAsAdhan ? t`Selected as adhan` : ''
                }
              />
              {isSelectedAsFajrAdhan && (
                <CheckIcon
                  mr="1"
                  size="md"
                  color={isSelectedAsFajrAdhan ? 'primary.500' : 'transparent'}
                  accessibilityLabel={
                    isSelectedAsFajrAdhan ? t`Selected as fajr adhan` : ''
                  }
                />
              )}
              <Text flex={1} flexGrow={1} noOfLines={1}>
                {item.internal
                  ? i18n._(adhanEntryTranslations[item.id])
                  : item.label}
              </Text>
            </HStack>

            <HStack flexShrink={0} flexGrow={0} alignItems="center">
              {!item?.filepath && item.remoteUri && (
                <Button
                  onPress={() => toggleDownload(item.remoteUri!)}
                  p="2"
                  variant="ghost">
                  {dlTask !== null ? (
                    <CloseIcon
                      size="xl"
                      accessibilityLabel={t`Cancel download`}
                    />
                  ) : (
                    <DownloadIcon size="xl" accessibilityLabel={t`Download`} />
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
                    <StopIcon size="xl" accessibilityLabel={t`Stop`} />
                  ) : (
                    <PlayIcon size="xl" accessibilityLabel={t`Play`} />
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
