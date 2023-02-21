import {t} from '@lingui/macro';
import {Text, Box, Button, Spacer} from 'native-base';
import {memo, useCallback, useEffect, useRef, useState} from 'react';
import {finishAndRemoveTask, getActivityName} from '@/modules/activity';
import {replace} from '@/navigation/root_navigation';
import {
  cancelAlarmNotif,
  getAlarmOptions,
  getFgSvcNotification,
} from '@/notifee';
import {stopAudio} from '@/services/audio_service';
import {useSettings} from '@/store/settings';
import {SetAlarmTaskOptions} from '@/tasks/set_alarm';
import {getTime} from '@/utils/date';
import {usePrevious} from '@/utils/hooks/use_previous';

function FullscreenAlarm() {
  const [fullscreenOptions, setFullscreenOptions] = useState<{
    title: String;
    subtitle: String;
    body: String;
  }>({
    title: '',
    subtitle: '',
    body: '',
  });

  const [isPlayingAudio] = useSettings('IS_PLAYING_AUDIO');

  const [taskOptions, setTaskOptions] = useState<
    SetAlarmTaskOptions | undefined
  >(undefined);

  const handlingFinish = useRef(false);

  const audioFinished = useCallback(async () => {
    if (handlingFinish.current) return;
    handlingFinish.current = true;
    if ((await getActivityName()) === 'AlarmActivity') {
      return finishAndRemoveTask();
    } else {
      await stopAudio();
      return replace('Home');
    }
  }, []);

  useEffect(() => {
    getFgSvcNotification().then(async notification => {
      const options = getAlarmOptions(notification);
      if (!options) {
        await audioFinished();
      }
      setTaskOptions(options);
    });
  }, [audioFinished]);

  const previousIsPlaying = usePrevious(isPlayingAudio);

  useEffect(() => {
    if (previousIsPlaying && !isPlayingAudio) {
      audioFinished();
    }
  }, [audioFinished, isPlayingAudio, previousIsPlaying]);

  useEffect(() => {
    if (!taskOptions) return;
    let title = t`Adhan`;
    let body = taskOptions.body || '';
    let subtitle = '';
    if (taskOptions.isReminder) {
      title = t`Reminder`;
      subtitle = taskOptions.subtitle || '';
    } else {
      subtitle = taskOptions.title;
      body = getTime(taskOptions.date);
    }
    setFullscreenOptions({
      title,
      body,
      subtitle,
    });
  }, [taskOptions]);

  const onDismissPress = useCallback(async () => {
    if (!taskOptions) {
      return;
    }
    await cancelAlarmNotif({
      options: taskOptions,
      notification: {android: {asForegroundService: true}},
    });
    await audioFinished();
  }, [audioFinished, taskOptions]);

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
