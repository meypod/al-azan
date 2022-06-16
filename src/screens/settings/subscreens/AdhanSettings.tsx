import {t} from '@lingui/macro';
import {IStackProps, FlatList, Box} from 'native-base';
import {useState} from 'react';
import {ToastAndroid} from 'react-native';
import {Event, State, useTrackPlayerEvents} from 'react-native-track-player';
import {AdhanEntry} from '@/assets/adhan_entries';

import {AdhanListItem} from '@/screens/settings/components/AdhanListItem';
import {play, stop} from '@/services/play_sound';
import {useSettingsHelper} from '@/store/settings';

export function AdhanSettings(props: IStackProps) {
  const [playerState, setPlayerState] = useState<State | null>(null);
  const [playingAdhanEntry, setPlayingAdhanEntry] = useState<
    AdhanEntry | undefined
  >();
  const [selectedAdhanEntry, setSelectedAdhanEntry] = useSettingsHelper(
    'SELECTED_ADHAN_ENTRY',
  );

  const [savedAdhanEntries] = useSettingsHelper('SAVED_ADHAN_AUDIO_ENTRIES');

  useTrackPlayerEvents([Event.PlaybackState, Event.PlaybackError], event => {
    if (event.type === Event.PlaybackError) {
      ToastAndroid.show(
        t`An error occured while playing the current track`,
        ToastAndroid.SHORT,
      );
    }
    if (event.type === Event.PlaybackState) {
      setPlayerState(event.state);
    }
  });

  const playAdhanEntry = async (item: AdhanEntry) => {
    try {
      if (playingAdhanEntry?.id === item.id && playerState === State.Playing) {
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

  const renderItem = ({item}: {item: AdhanEntry}) => {
    return (
      <AdhanListItem
        onPress={() => onAdhanItemPressed(item)}
        key={item.id}
        item={item}
        playAdhanEntry={playAdhanEntry}
        playerState={playerState}
        selected_item_id={selectedAdhanEntry?.id}
        playing_item_id={playingAdhanEntry?.id}
      />
    );
  };

  return (
    <Box safeArea py="4" {...props}>
      <FlatList
        data={savedAdhanEntries}
        renderItem={renderItem}
        extraData={[playerState]}
      />
    </Box>
  );
}
