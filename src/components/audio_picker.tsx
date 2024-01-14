import {i18n} from '@lingui/core';
import {t} from '@lingui/macro';
import {produce} from 'immer';
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
  Stack,
  SectionList,
  Button,
} from 'native-base';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ListRenderItemInfo,
  ToastAndroid,
  FlatList as FlatListType,
} from 'react-native';
import {pickSingle} from 'react-native-document-picker';
import {useStore} from 'zustand';
import {shallow} from 'zustand/shallow';
import AudioPickerItem from './audio_picker_item';
import {NewAudioDialog} from './new_audio_dialog';
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
import {showDeleteDialog} from '@/utils/dialogs';
import useFuse from '@/utils/hooks/use_fuse';

function useData() {
  const {adhanEntries, userEntries, defaultAdhan} = useStore(
    settings,
    s => ({
      userEntries: s.SAVED_USER_AUDIO_ENTRIES,
      adhanEntries: s.SAVED_ADHAN_AUDIO_ENTRIES.filter(e => !!e.filepath).map(
        ent =>
          produce(ent, e => {
            {
              if (e.internal) {
                e.label = i18n._(adhanEntryTranslations[e.id]);
              }
              (e as any).a = true;
            }
          }),
      ) as AudioEntry[],
      defaultAdhan: produce(s.SELECTED_ADHAN_ENTRIES['default'], e => {
        if (e.internal) {
          e.label = i18n._(adhanEntryTranslations[e.id]);
        }
      }),
    }),
    shallow,
  );

  const [deviceEntries, setDeviceEntries] = useState<AudioEntry[]>([
    {
      id: 'default',
      label: t`Default` + ` (${t`Notification`})`,
      filepath: null as any,
      notif: true,
    },
  ]);

  const sections = useMemo(() => {
    const arr = [];

    if (userEntries.length) {
      arr.push({
        title: t`Your sounds`,
        data: userEntries,
      });
    }

    arr.push({
      title: t({
        id: 'muezzin_settings',
        message: 'Muezzin',
      }),
      data: adhanEntries,
    });

    arr.push({
      title: t`Device sounds`,
      data: deviceEntries,
    });

    return arr;
  }, [adhanEntries, deviceEntries, userEntries]);

  useMemo(() => {
    getRingtones().then(entries => {
      if (entries.length)
        entries[0].label = t`Default` + ` (${t`Notification`})`; // first item is always default;

      if (entries.length > 1) {
        for (let i = 1; i < entries.length; i++) {
          if (entries[i].loop) {
            entries[i].label = entries[i].label + ` (${t`Repeat`})`;
          }
        }
      }
      entries.splice(1, 0, {
        id: 'silent',
        label: t`Silent`,
        filepath: 'silent',
      });
      setDeviceEntries(entries);
    });
  }, []);

  return {sections, deviceEntries, defaultAdhan};
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
    adhan = false,
    ...inputProps
  } = props;

  const {isOpen, onOpen, onClose} = useDisclose();
  const [searchValue, setSearchValue] = useState<string>('');
  const {sections, deviceEntries, defaultAdhan} = useData();
  const playbackState = usePlaybackState();
  const [localIsPlaying, setLocalIsPlaying] = useState(
    playbackState === PlaybackState.started,
  );

  useEffect(() => {
    if (
      playbackState === PlaybackState.stopped ||
      playbackState === PlaybackState.paused
    ) {
      setLocalIsPlaying(false);
    }
  }, [playbackState]);

  const flatlistRef = useRef<FlatListType>(null);

  const [draftAudioEntry, setDraftAudioEntry] = useState<
    AudioEntry | undefined
  >();

  const onNewAudioSave = useCallback(
    (audioName: string) => {
      if (adhan) {
        settings.getState().saveAdhanEntry({
          ...(draftAudioEntry as Required<AudioEntry>),
          label: audioName,
        });
      } else {
        settings.getState().saveAudioEntry({
          ...(draftAudioEntry as Required<AudioEntry>),
          label: audioName,
        });
      }

      setDraftAudioEntry(undefined);
    },
    [adhan, draftAudioEntry],
  );

  const dataForFuse = useMemo(() => {
    if (searchValue) {
      return sections.map(s => s.data).flat();
    } else {
      return [];
    }
  }, [searchValue, sections]);

  const {results, setSearchTerm} = useFuse(dataForFuse, {
    keys: autoCompleteKeys,
    threshold: 0.3,
  });

  const memoSelectedItem = useMemo(() => {
    if (selectedItem) {
      return selectedItem;
    }
    return adhan ? (defaultAdhan as AudioEntry) : deviceEntries[0];
  }, [selectedItem, adhan, defaultAdhan, deviceEntries]);

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
        setLocalIsPlaying(false);
      }
    },
    [onItemSelected, onClose, playbackState],
  );

  const textValue = useMemo(() => {
    return (
      (memoSelectedItem && getOptionLabel(memoSelectedItem as AudioEntry)) || ''
    );
  }, [getOptionLabel, memoSelectedItem]);

  const onDeletePress = useCallback(
    async (item: AudioEntry) => {
      const agreedToDelete = await showDeleteDialog(
        (item as any).internal
          ? i18n._(adhanEntryTranslations[item.id])
          : item.label,
      );
      if (agreedToDelete) {
        if ((item as any).a) {
          settings.getState().deleteAdhanEntry(item);
        } else {
          settings.getState().deleteAudioEntry(item);
        }
      }
      if (agreedToDelete && item.id === memoSelectedItem?.id) {
        onItemSelected &&
          onItemSelected(
            adhan ? (defaultAdhan as AudioEntry) : deviceEntries[0],
          );
      }
    },
    [memoSelectedItem?.id, onItemSelected, adhan, defaultAdhan, deviceEntries],
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
    pickSingle({
      copyTo: 'documentDirectory',
      type: [
        'audio/mpeg',
        'audio/ogg',
        'application/ogg',
        'audio/opus',
        'audio/x-wav',
        'audio/webm',
        'audio/m4a',
      ],
    })
      .then(val => {
        if (val.copyError) {
          console.error(val.copyError);
          ToastAndroid.show(val.copyError, ToastAndroid.LONG);
        } else {
          const id = 'audio_' + Date.now().toString();
          setDraftAudioEntry({
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
      await stop();
      if (!localIsPlaying) {
        setLocalIsPlaying(true);
        await play({audioEntry: memoSelectedItem, preferExternalDevice: true});
      }
    } catch (e) {
      console.error(e);
    }
  }, [memoSelectedItem, localIsPlaying]);

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
        accessibilityRole="combobox"
        accessibilityHint=""
        accessibilityLabel={textValue}
        placeholder={t`Press to search`}
        onAccessibilityAction={onOpen}
        value={textValue}
        autoCorrect={false}
        caretHidden={true}
        _input={{
          contextMenuHidden: true,
        }}
        rightElement={
          memoSelectedItem && memoSelectedItem.id !== 'silent' ? (
            <Button onPress={toggleAudioEntry} p="2" variant="ghost">
              {localIsPlaying ? (
                <StopIcon size="xl" accessibilityLabel={t`Stop`} />
              ) : (
                <PlayIcon size="xl" accessibilityLabel={t`Play`} />
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
              <Stack
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
              </Stack>
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
      <NewAudioDialog
        initialAudioName={draftAudioEntry?.label}
        onCancel={setDraftAudioEntry}
        onSave={onNewAudioSave}
        selectedFilePath={draftAudioEntry?.filepath as string}
      />
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
        `[AudioPicker warn]: Could not stringify option ` +
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
        `[AudioPicker warn]: Label key "option.${label}" does not` +
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
  adhan?: boolean;
  errorMessage?: string;
  actionsheetLabel?: string;
  selectedItem?: AudioEntry;
  autoCompleteKeys?: string[];
  getOptionKey?: (item: AudioEntry) => string;
  getOptionLabel?: (item: AudioEntry) => string;
  onItemSelected?: (item: AudioEntry) => void;
};

export default AudioPicker;
