import {t} from '@lingui/macro';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  FlatList,
  Stack,
  Button,
  Modal,
  FormControl,
  Input,
  WarningOutlineIcon,
  Text,
  IStackProps,
  ScrollView,
} from 'native-base';
import {useCallback, useEffect, useState} from 'react';
import {ToastAndroid} from 'react-native';
import {pickSingle} from 'react-native-document-picker';
import {useStore} from 'zustand';
import {shallow} from 'zustand/shallow';
import {Prayer, PrayersInOrder} from '@/adhan';
import {AdhanEntry} from '@/assets/adhan_entries';
import PrayerAdhan from '@/components/prayer_adhan';
import {SafeArea} from '@/components/safe_area';
import MediaPlayer, {
  AudioEntry,
  PlaybackState,
  usePlaybackState,
} from '@/modules/media_player';
import {RootStackParamList} from '@/navigation/types';

import {AdhanListItem} from '@/screens/settings_adhan/adhan_list_item';
import {play, stop, destroy} from '@/services/play_sound';
import {settings} from '@/store/settings';

type AdhanSettingsProps = NativeStackScreenProps<
  RootStackParamList,
  'AdhanSettings'
>;

export function AdhanSettings(props: IStackProps & AdhanSettingsProps) {
  const {navigation} = props;

  const [playingAdhanEntry, setPlayingAdhanEntry] = useState<
    AdhanEntry | undefined
  >();

  const {
    SELECTED_ADHAN_ENTRIES,
    setSelectedAdhan,
    resetPrayerAdhans,
    SAVED_ADHAN_AUDIO_ENTRIES,
    ADVANCED_CUSTOM_ADHAN,
  } = useStore(
    settings,
    s => ({
      SELECTED_ADHAN_ENTRIES: s.SELECTED_ADHAN_ENTRIES,
      setSelectedAdhan: s.setSelectedAdhan,
      SAVED_ADHAN_AUDIO_ENTRIES: s.SAVED_ADHAN_AUDIO_ENTRIES,
      ADVANCED_CUSTOM_ADHAN: s.ADVANCED_CUSTOM_ADHAN,
      resetPrayerAdhans: s.resetPrayerAdhans,
    }),
    shallow,
  );

  const setSelectedFajrAdhan = useCallback(
    (item: AdhanEntry | undefined) => setSelectedAdhan(Prayer.Fajr, item),
    [setSelectedAdhan],
  );

  const [selectedFilePath, setSelectedFilePath] = useState<string>();
  const [newAdhanName, setNewAdhanName] = useState<string | null>();
  const playerState = usePlaybackState();

  useEffect(() => {
    const sub = MediaPlayer.addEventListener('error', () => {
      ToastAndroid.show(
        t`An error occured while playing the current track`,
        ToastAndroid.SHORT,
      );
    });
    return () => {
      sub.remove();
    };
  });

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      destroy();
    });

    return unsubscribe;
  });

  if (ADVANCED_CUSTOM_ADHAN) {
    return (
      <SafeArea>
        <ScrollView>
          <Stack flex={1} px="4" py="2" {...props}>
            {PrayersInOrder.map(prayer => (
              <PrayerAdhan
                prayer={prayer}
                key={prayer}
                selectedEntry={SELECTED_ADHAN_ENTRIES[prayer] as AudioEntry}
                setSelectedAdhan={setSelectedAdhan}
              />
            ))}
          </Stack>
        </ScrollView>
      </SafeArea>
    );
  }

  const playAdhanEntry = async (item: AdhanEntry) => {
    try {
      if (
        playingAdhanEntry?.id === item.id &&
        playerState === PlaybackState.started
      ) {
        await stop();
      } else {
        setPlayingAdhanEntry(item);
        await stop();
        if (item.filepath) {
          await play({
            audioEntry: item as AudioEntry,
            preferExternalDevice: true,
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const onAdhanItemPressed = (item: AdhanEntry) => {
    if (item.filepath) {
      resetPrayerAdhans(item);
    } else {
      ToastAndroid.show(
        t`Adhan audio file is not downloaded yet`,
        ToastAndroid.SHORT,
      );
    }
  };

  const onAddCustomAdhanPressed = () => {
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
          setNewAdhanName(val.name);
          setSelectedFilePath(val.fileCopyUri!);
        }
      })
      .catch(() => {});
  };

  const renderItem = ({item}: {item: AdhanEntry}) => {
    return (
      <AdhanListItem
        onAdhanSelected={onAdhanItemPressed}
        onFajrAdhanSelected={setSelectedFajrAdhan}
        key={item.id}
        item={item}
        playAdhanEntry={playAdhanEntry}
        playerState={playerState}
        selected_item_id={SELECTED_ADHAN_ENTRIES.default.id}
        selected_fajr_item_id={SELECTED_ADHAN_ENTRIES.fajr?.id}
        playing_item_id={playingAdhanEntry?.id}
      />
    );
  };

  const onNewAdhanCancel = () => {
    setSelectedFilePath(undefined);
    setNewAdhanName(null);
  };

  const onNewAdhanAdd = () => {
    if (!newAdhanName) return;
    settings.getState().saveAdhanEntry({
      id: 'adhan_' + Date.now().toString(),
      canDelete: true,
      label: newAdhanName,
      filepath: selectedFilePath,
    });
    onNewAdhanCancel();
  };

  return (
    <SafeArea>
      <Stack flex={1} pt="4" {...props}>
        <FlatList
          flex={1}
          data={SAVED_ADHAN_AUDIO_ENTRIES}
          renderItem={renderItem}
          extraData={[playerState]}
        />
        <Button
          onPress={onAddCustomAdhanPressed}
          m="1">{t`Add Custom Adhan`}</Button>

        <Modal
          size="full"
          isOpen={!!selectedFilePath}
          onClose={onNewAdhanCancel}>
          <Modal.Content borderRadius={0}>
            <Modal.CloseButton />
            <Modal.Header>{t`Add Custom Adhan`}</Modal.Header>
            <Modal.Body>
              <FormControl isInvalid={!newAdhanName}>
                <FormControl.Label>{t`Name`}</FormControl.Label>
                <Input
                  value={newAdhanName || ''}
                  placeholder={t`Name`}
                  onChangeText={str => setNewAdhanName(str)}
                />
                <FormControl.ErrorMessage
                  leftIcon={<WarningOutlineIcon color="yellow.300" />}>
                  <Text color="yellow.400">
                    {t`Selecting a name is required`}
                  </Text>
                </FormControl.ErrorMessage>
              </FormControl>
            </Modal.Body>
            <Modal.Footer>
              <Button mx="2" colorScheme="coolGray" onPress={onNewAdhanCancel}>
                {t`Cancel`}
              </Button>
              <Button colorScheme="coolGray" onPress={onNewAdhanAdd}>
                {t`Add`}
              </Button>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
      </Stack>
    </SafeArea>
  );
}
