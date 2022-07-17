import {t} from '@lingui/macro';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Text, Box, Button, StatusBar, Spacer} from 'native-base';
import {memo, useCallback, useEffect, useState} from 'react';
import {BackHandler} from 'react-native';
import {Prayer, translatePrayer} from '@/adhan';
import {replace} from '@/navigation/root_navigation';
import {RootStackParamList} from '@/navigation/types';
import {cancelAdhanNotif, isAdhanPlaying} from '@/notifee';
import {SetAlarmTaskOptions} from '@/tasks/set_alarm';
import {getTime24} from '@/utils/date';

type ScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'FullscreenAlarm'
>;

function FullscreenAlarm({route}: ScreenProps) {
  const [adhanOptions, setAdhanOptions] = useState<{
    date: Date;
    prayer?: Prayer;
  }>({
    date: new Date(),
    prayer: undefined,
  });

  const [time24, setTime24] = useState('');
  const [prayerTranslation, setPrayerTranslation] = useState('');

  useEffect(() => {
    if (adhanOptions.prayer) {
      setPrayerTranslation(translatePrayer(adhanOptions.prayer));
    } else {
      setPrayerTranslation('');
    }
    setTime24(getTime24(adhanOptions.date));
  }, [adhanOptions]);

  useEffect(() => {
    const parsedAdhanOptions = JSON.parse(
      route.params.options,
    ) as SetAlarmTaskOptions;
    parsedAdhanOptions.date = new Date(parsedAdhanOptions.date);
    setAdhanOptions(parsedAdhanOptions);
    isAdhanPlaying().then(isPlaying => {
      if (!isPlaying) {
        replace('Home');
      }
    });
  }, [route]);

  const onDismissPress = useCallback(async () => {
    const isPlaying = await isAdhanPlaying();
    if (isPlaying) {
      await cancelAdhanNotif();
      BackHandler.exitApp();
    } else {
      replace('Home');
    }
  }, []);

  return (
    <Box
      flex={1}
      flexDirection="column"
      safeArea
      alignItems="stretch"
      display="flex">
      <StatusBar />
      <Text
        textAlign="center"
        fontSize="sm"
        adjustsFontSizeToFit
        noOfLines={1}
        borderBottomWidth={1}
        borderBottomColor="coolGray.300">
        {t`Adhan`}
      </Text>
      <Box margin="2">
        <Text
          adjustsFontSizeToFit
          noOfLines={1}
          textAlign="center"
          fontSize="6xl"
          marginBottom={3}>
          {prayerTranslation}
        </Text>
        <Text
          adjustsFontSizeToFit
          noOfLines={1}
          fontSize="4xl"
          textAlign="center">
          {time24}
        </Text>
      </Box>
      <Spacer />
      <Button
        height="100"
        onPress={onDismissPress}
        margin="2"
        _text={{
          allowFontScaling: false,
          fontSize: '3xl',
        }}>
        {t`Dismiss`}
      </Button>
    </Box>
  );
}

export default memo(FullscreenAlarm);
