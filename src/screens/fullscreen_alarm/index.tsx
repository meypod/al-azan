import {t} from '@lingui/macro';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Text, Box, Button, Spacer} from 'native-base';
import {memo, useCallback, useEffect, useState} from 'react';
import {BackHandler} from 'react-native';
import {replace} from '@/navigation/root_navigation';
import {RootStackParamList} from '@/navigation/types';
import {cancelAlarmNotif} from '@/notifee';
import {isPlayingAdhan} from '@/services/azan_service';
import {SetAlarmTaskOptions} from '@/tasks/set_alarm';
import {getTime} from '@/utils/date';

type ScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'FullscreenAlarm'
>;

function FullscreenAlarm({route}: ScreenProps) {
  const [fullscreenOptions, setFullscreenOptions] = useState<{
    date: Date;
    title: String;
    subtitle: String;
    body: String;
  }>({
    date: new Date(),
    title: '',
    subtitle: '',
    body: '',
  });

  useEffect(() => {
    const parsedAlarmOptions = JSON.parse(
      route.params.options || 'false',
    ) as SetAlarmTaskOptions;
    if (!parsedAlarmOptions) {
      replace('Home');
      return;
    }
    parsedAlarmOptions.date = new Date(parsedAlarmOptions.date);
    let title = t`Adhan`;
    let body = parsedAlarmOptions.body || '';
    let subtitle = '';
    if (parsedAlarmOptions.isReminder) {
      title = t`Reminder`;
      subtitle = parsedAlarmOptions.subtitle || '';
    } else {
      subtitle = parsedAlarmOptions.title;
      body = getTime(parsedAlarmOptions.date);
    }
    setFullscreenOptions({
      title,
      body,
      subtitle,
      date: parsedAlarmOptions.date,
    });

    if (!isPlayingAdhan()) {
      replace('Home');
    }
  }, [route]);

  const onDismissPress = useCallback(async () => {
    const parsedAlarmOptions = JSON.parse(
      route.params.options || 'false',
    ) as SetAlarmTaskOptions;
    if (!parsedAlarmOptions) {
      replace('Home');
      return;
    }
    if (isPlayingAdhan()) {
      await cancelAlarmNotif({
        options: parsedAlarmOptions,
        notification: {android: {asForegroundService: true}},
      });
      BackHandler.exitApp();
    } else {
      replace('Home');
    }
  }, [route]);

  return (
    <Box
      flex={1}
      flexDirection="column"
      safeArea
      alignItems="stretch"
      display="flex">
      <Text
        textAlign="center"
        fontSize="sm"
        adjustsFontSizeToFit
        noOfLines={1}
        borderBottomWidth={1}
        borderBottomColor="coolGray.300">
        {fullscreenOptions.title}
      </Text>
      <Box margin="2">
        <Text
          adjustsFontSizeToFit
          noOfLines={1}
          textAlign="center"
          fontSize="6xl"
          marginBottom={3}>
          {fullscreenOptions.subtitle}
        </Text>
        <Text
          adjustsFontSizeToFit
          noOfLines={1}
          fontSize="4xl"
          textAlign="center">
          {fullscreenOptions.body}
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
