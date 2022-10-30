import {t} from '@lingui/macro';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  FlatList,
  Box,
  Button,
  Modal,
  FormControl,
  Input,
  WarningOutlineIcon,
  Text,
  IBoxProps,
} from 'native-base';
import {useEffect, useState} from 'react';
import {ToastAndroid} from 'react-native';
import {pickSingle} from 'react-native-document-picker';

import {AdhanEntry} from '@/assets/adhan_entries';
import MediaPlayer, {
  PlaybackState,
  usePlaybackState,
} from '@/modules/media_player';
import {RootStackParamList} from '@/navigation/types';
import {AdhanListItem} from '@/screens/settings_adhan/adhan_list_item';
import {play, stop, destroy} from '@/services/play_sound';
import {settings, useSettingsHelper} from '@/store/settings';

type AdhanSettingsProps = NativeStackScreenProps<
  RootStackParamList,
  'AdhanSettings'
>;

export function AdhanSettings(props: IBoxProps & AdhanSettingsProps) {
  const {navigation} = props;

  const [playingAdhanEntry, setPlayingAdhanEntry] = useState<
    AdhanEntry | undefined
  >();
  const [selectedAdhanEntry, setSelectedAdhanEntry] = useSettingsHelper(
    'SELECTED_ADHAN_ENTRY',
  );
  const [selectedFajrAdhanEntry, setSelectedFajrAdhanEntry] = useSettingsHelper(
    'SELECTED_FAJR_ADHAN_ENTRY',
  );

  const [savedAdhanEntries] = useSettingsHelper('SAVED_ADHAN_AUDIO_ENTRIES');

  const [selectedFilePath, setSelectedFilePath] = useState<string>();
  const [newAdhanName, setNewAdhanName] = useState<string>();
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
        await play((item?.filepath || item?.remoteUri) as string | number);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const onAdhanItemPressed = (item: AdhanEntry) => {
    if (item.filepath) {
      setSelectedAdhanEntry(item);
    } else {
      ToastAndroid.show(
        t`Adhan audio file is not downloaded yet`,
        ToastAndroid.SHORT,
      );
    }
  };

  const onAddCustomAdhanPressed = () => {
    pickSingle({copyTo: 'documentDirectory', type: 'audio/mpeg'})
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
        onFajrAdhanSelected={setSelectedFajrAdhanEntry}
        key={item.id}
        item={item}
        playAdhanEntry={playAdhanEntry}
        playerState={playerState}
        selected_item_id={selectedAdhanEntry?.id}
        selected_fajr_item_id={selectedFajrAdhanEntry?.id}
        playing_item_id={playingAdhanEntry?.id}
      />
    );
  };

  const onNewAdhanCancel = () => {
    setSelectedFilePath(undefined);
    setNewAdhanName(undefined);
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
    <Box flex={1} safeArea py="4" {...props}>
      <FlatList
        flex={1}
        data={savedAdhanEntries}
        renderItem={renderItem}
        extraData={[playerState]}
      />
      <Button
        onPress={onAddCustomAdhanPressed}
        m="1">{t`Add Custom Adhan`}</Button>

      <Modal size="full" isOpen={!!selectedFilePath} onClose={onNewAdhanCancel}>
        <Modal.Content borderRadius={0}>
          <Modal.CloseButton />
          <Modal.Header>{t`Add Custom Adhan`}</Modal.Header>
          <Modal.Body>
            <FormControl isInvalid={!newAdhanName}>
              <FormControl.Label>{t`Name`}</FormControl.Label>
              <Input
                value={newAdhanName}
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
    </Box>
  );
}
