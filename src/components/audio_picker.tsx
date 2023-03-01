import {i18n} from '@lingui/core';
import {t} from '@lingui/macro';
import debounce from 'lodash/debounce';
import {
  FlatList,
  Input,
  IInputProps,
  Text,
  useDisclose,
  Actionsheet,
  KeyboardAvoidingView,
  SearchIcon,
  HStack,
  Box,
  SectionList,
  Button,
} from 'native-base';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Alert,
  ListRenderItemInfo,
  ToastAndroid,
  FlatList as FlatListType,
} from 'react-native';
import {pickSingle} from 'react-native-document-picker';
import {useStore} from 'zustand';
import {shallow} from 'zustand/shallow';
import AudioPickerItem from './audio_picker_item';
import {adhanEntryTranslations} from '@/assets/adhan_entries';
import {AddIcon} from '@/assets/icons/material_icons/add';
import {PlayIcon} from '@/assets/icons/material_icons/play';
import {StopIcon} from '@/assets/icons/material_icons/stop';
import {
  AudioEntry,
  getRingtones,
  PlaybackState,
  usePlaybackState,
} from '@/modules/media_player';
import {play, stop} from '@/services/play_sound';
import {settings} from '@/store/settings';
import useFuse from '@/utils/hooks/use_fuse';

function useData() {
  const state = useStore(
    settings,
    s => ({
      audioEntries: s.SAVED_USER_AUDIO_ENTRIES,
      adhanEntries: s.SAVED_ADHAN_AUDIO_ENTRIES,
    }),
    shallow,
  );
  const [data, setData] = useState({
    userEntries: [] as AudioEntry[],
    adhanEntries: [] as AudioEntry[],
    deviceEntries: [
      {
        id: 'default',
        label: t`Default` + ` (${t`Notification`})`,
        filepath: null as unknown,
        notif: true,
      },
    ] as AudioEntry[],
  });

  useEffect(
    () =>
      setData(d => ({
        userEntries: state.audioEntries || ([] as AudioEntry[]),
        adhanEntries: state.adhanEntries
          .filter(e => !!e.filepath)
          .map(e => {
            const copy = {...e};
            if (copy.internal) {
              copy.label = i18n._(adhanEntryTranslations[e.id]);
            }
            (copy as any).a = true;
            return copy;
          }) as AudioEntry[],
        deviceEntries: d.deviceEntries,
      })),
    [state],
  );

  useEffect(() => {
    getRingtones().then(entries => {
      const [def, ...rest] = entries;
      if (def) def.label = t`Default` + ` (${t`Notification`})`; // first item is always default;

      if (rest.length) {
        for (const e of rest) {
          if (e.loop) {
            e.label = e.label + ` (${t`Repeat`})`;
          }
        }
      }

      const newEntries = [
        def,
        {
          id: 'silent',
          label: t`Silent`,
          filepath: 'silent',
        },
        ...rest,
      ];
      setData(d => ({
        userEntries: d.userEntries,
        adhanEntries: d.adhanEntries,
        deviceEntries: newEntries,
      }));
    });
  }, []);

  const sections = useMemo(() => {
    const s = [];
    if (data.userEntries.length) {
      s.push({
        title: t`Your sounds`,
        data: data.userEntries,
      });
    }

    s.push({
      title: t({
        id: 'muezzin_settings',
        message: 'Muezzin',
      }),
      data: data.adhanEntries,
    });

    if (data.deviceEntries.length) {
      s.push({
        title: t`Device sounds`,
        data: data.deviceEntries,
      });
    }
    return s;
  }, [data]);

  return {sections, data};
}

function showDeleteDialog(item: AudioEntry) {
  return new Promise(resolve => {
    Alert.alert(
      t`Delete`,
      t`Are you sure you want to delete "${
        (item as any).internal
          ? i18n._(adhanEntryTranslations[item.id])
          : item.label
      }" ?`,
      [
        {
          text: t`No`,
          style: 'cancel',
          onPress: () => resolve(false),
        },
        {
          text: t`Yes`,
          onPress: () => {
            if ((item as any).a) {
              settings.getState().deleteAdhanEntry(item);
            } else {
              settings.getState().deleteAudioEntry(item);
            }
            resolve(true);
          },
          style: 'destructive',
        },
      ],
    );
  });
}

export const AudioPicker = (props: AudioPickerProps) => {
  const {
    label,
    autoCompleteKeys,
    getOptionKey = defaultGetOptionKey,
    getOptionLabel = defaultGetOptionLabel(label || 'label'),
    onItemSelected = () => {},
    actionsheetLabel,
    selectedItem,
    ...inputProps
  } = props;

  const {isOpen, onOpen, onClose} = useDisclose();
  const [searchValue, setSearchValue] = useState<string>('');
  const {data, sections} = useData();
  const playbackState = usePlaybackState();
  const flatlistRef = useRef<FlatListType>(null);

  const dataForFuse = useMemo(() => {
    if (searchValue) {
      return [...data.userEntries, ...data.adhanEntries, ...data.deviceEntries];
    } else {
      return [];
    }
  }, [data, searchValue]);

  const {results, setSearchTerm} = useFuse(dataForFuse, {
    keys: autoCompleteKeys,
    threshold: 0.3,
  });

  const memoSelectedItem = useMemo(() => {
    if (selectedItem) {
      return selectedItem;
    }
    if (data.deviceEntries.length) {
      return data.deviceEntries[0];
    }
    return undefined;
  }, [data.deviceEntries, selectedItem]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateSearchTerm = useCallback(
    debounce((term: string) => {
      setSearchTerm(term);
    }, 150),
    [setSearchTerm],
  );

  const onChangeText = useCallback(
    (text: string) => {
      setSearchValue(text);
      updateSearchTerm(text);
    },
    [updateSearchTerm, setSearchValue],
  );

  const onListItemPressed = useCallback(
    (item: AudioEntry, index: number) => {
      onItemSelected &&
        onItemSelected({...item, index} as unknown as AudioEntry);
      onClose();
      setSearchValue('');
      if (playbackState !== PlaybackState.stopped) {
        stop();
      }
    },
    [onItemSelected, onClose, playbackState],
  );

  const textValue = useMemo(
    () => (memoSelectedItem && getOptionLabel(memoSelectedItem)) || '',
    [getOptionLabel, memoSelectedItem],
  );

  const onDeletePress = useCallback(
    async (item: AudioEntry) => {
      if ((await showDeleteDialog(item)) && item.id === memoSelectedItem?.id) {
        onItemSelected && onItemSelected(data.deviceEntries[0]);
      }
    },
    [data.deviceEntries, memoSelectedItem?.id, onItemSelected],
  );

  const memoizedRenderItem = useCallback(
    ({item, index}: ListRenderItemInfo<AudioEntry>) => (
      <AudioPickerItem
        getOptionLabel={getOptionLabel}
        onDeletePress={onDeletePress}
        onPress={onListItemPressed}
        item={item}
        index={index}
        isSelected={memoSelectedItem?.id == item.id}
      />
    ),
    [getOptionLabel, onDeletePress, onListItemPressed, memoSelectedItem],
  );

  const memoizedSectionFn = useMemo(
    () =>
      // eslint-disable-next-line react/display-name
      ({section: {title}}: any) =>
        (
          <Text fontSize="md" fontWeight="bold" mt="1">
            {title}
          </Text>
        ),
    [],
  );

  const onAddPressed = useCallback(() => {
    pickSingle({copyTo: 'documentDirectory', type: 'audio/mpeg'})
      .then(val => {
        if (val.copyError) {
          console.error(val.copyError);
          ToastAndroid.show(val.copyError, ToastAndroid.LONG);
        } else {
          const id = 'audio_' + Date.now().toString();
          settings.getState().saveAudioEntry({
            id,
            label: val.name || id,
            filepath: val.fileCopyUri!,
            canDelete: true,
          });
        }
      })
      .catch(() => {});
  }, []);

  const toggleAudioEntry = useCallback(async () => {
    try {
      if (!memoSelectedItem) return;
      if (memoSelectedItem.id === 'silent') return;
      if (playbackState === PlaybackState.started) {
        await stop();
      } else {
        await play(memoSelectedItem);
      }
    } catch (e) {
      console.error(e);
    }
  }, [memoSelectedItem, playbackState]);

  const onOpenProxy = useCallback(async () => {
    try {
      onOpen();
      // TODO: when migrated ui, scroll to selecte Item of flat list
    } catch (e) {
      console.error(e);
    }
  }, [onOpen]);

  const onCloseProxy = useCallback(async () => {
    try {
      await stop();
      onClose();
    } catch (e) {
      console.error(e);
    }
  }, [onClose]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  return (
    <HStack>
      <Input
        flexGrow={1}
        onTouchEnd={onOpenProxy}
        value={textValue}
        autoCorrect={false}
        caretHidden={true}
        _input={{
          contextMenuHidden: true,
        }}
        rightElement={
          memoSelectedItem && memoSelectedItem.id !== 'silent' ? (
            <Button onPress={toggleAudioEntry} p="2" variant="ghost">
              {playbackState === PlaybackState.started ? (
                <StopIcon size="xl" />
              ) : (
                <PlayIcon size="xl" />
              )}
            </Button>
          ) : undefined
        }
        {...inputProps}
      />

      <Actionsheet isOpen={isOpen} onClose={onCloseProxy}>
        <Actionsheet.Content minHeight="70%">
          <KeyboardAvoidingView>
            {actionsheetLabel && (
              <Text textAlign="center" mb="2">
                {actionsheetLabel}
              </Text>
            )}
            <HStack width="100%" mb="2">
              <Input
                flex={1}
                InputLeftElement={<SearchIcon ml="2" />}
                onChangeText={onChangeText}
                value={searchValue}
                placeholder={t`Search`}
              />
              <Button
                onPress={onAddPressed}
                ml="1"
                variant="outline"
                startIcon={<AddIcon size="xl" />}>{t`Add`}</Button>
            </HStack>
            {searchValue && !results.length && (
              <Box
                mt="2"
                pt="16"
                mb="6"
                _light={{
                  backgroundColor: 'gray.200',
                }}
                _dark={{
                  backgroundColor: 'gray.700',
                }}
                flexGrow="1"
                alignItems="center">
                <Text color="gray.400" fontSize="xl">
                  {t`No Results`}
                </Text>
              </Box>
            )}

            {searchValue ? (
              <FlatList
                flexShrink={1}
                flexGrow={0}
                data={results}
                renderItem={memoizedRenderItem}
                keyExtractor={getOptionKey}
                extraData={results}
                ref={flatlistRef}
              />
            ) : (
              <SectionList
                flexShrink={1}
                flexGrow={0}
                sections={sections}
                renderItem={memoizedRenderItem}
                renderSectionHeader={memoizedSectionFn}
                keyExtractor={getOptionKey}
                extraData={sections}
                ref={flatlistRef}
              />
            )}
          </KeyboardAvoidingView>
        </Actionsheet.Content>
      </Actionsheet>
    </HStack>
  );
};

const defaultGetOptionKey = (option: any) => {
  if (typeof option === 'object' && option.id) {
    return option.id;
  } else {
    try {
      return JSON.stringify(option);
    } catch (e) {
      return console.warn(
        `[AutocompleteInput warn]: Could not stringify option ` +
          `to generate unique key. Please provide 'getOptionKey' prop ` +
          `to return a unique key for each option.\n`,
      );
    }
  }
};

const defaultGetOptionLabel = (label: string) => (option: any) => {
  if (typeof option === 'object') {
    if (!Object.prototype.hasOwnProperty.call(option, label)) {
      return console.warn(
        `[AutocompleteInput warn]: Label key "option.${label}" does not` +
          ` exist in options object ${JSON.stringify(option)}.\n`,
      );
    }
    return option[label];
  }
  return option;
};

type AudioPickerProps = IInputProps & {
  label?: string;
  showError?: boolean;
  errorMessage?: string;
  actionsheetLabel?: string;
  selectedItem?: AudioEntry;
  autoCompleteKeys?: string[];
  getOptionKey?: (item: AudioEntry) => string;
  getOptionLabel?: (item: AudioEntry) => string;
  onItemSelected?: (item: AudioEntry) => void;
};

export default AudioPicker;
