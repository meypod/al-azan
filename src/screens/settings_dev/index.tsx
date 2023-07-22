import {t} from '@lingui/macro';
import {AlarmType} from '@notifee/react-native';
import {HStack, ScrollView, Text, IScrollViewProps, Button} from 'native-base';
import {useCallback} from 'react';
import {ToastAndroid} from 'react-native';
import {getNextPrayer, Prayer, translatePrayer} from '@/adhan';
import {SafeArea} from '@/components/safe_area';
import {
  ADHAN_CHANNEL_ID,
  ADHAN_DND_CHANNEL_ID,
  ADHAN_NOTIFICATION_ID,
} from '@/constants/notification';
import {VibrationMode, vibrate, vibrateStop} from '@/modules/activity';
import {AudioEntry} from '@/modules/media_player';
import {clearCache} from '@/store/adhan_calc_cache';
import {alarmSettings} from '@/store/alarm';
import {settings} from '@/store/settings';
import {SetAlarmTaskOptions, setAlarmTask} from '@/tasks/set_alarm';
import {getTime} from '@/utils/date';
import {getUpcommingTimeDay} from '@/utils/upcoming';

export function DevSettings(props: IScrollViewProps) {
  const scheduleAdhanInTen = useCallback((playSound: boolean) => {
    const date = new Date(Date.now() + 10 * 1000);
    const title = 'Test';
    let body: string | undefined = getTime(date);
    let subtitle: string | undefined = body;

    const {DONT_TURN_ON_SCREEN, VIBRATION_MODE, SHOW_NEXT_PRAYER_TIME} =
      alarmSettings.getState();

    if (SHOW_NEXT_PRAYER_TIME) {
      const next = getNextPrayer({
        date: new Date(date.valueOf() + 1000),
        checkNextDays: true,
        useSettings: true,
      });
      if (next) {
        body += ` - ${t`Next`}: ${translatePrayer(
          next.prayer,
        )}, ${getUpcommingTimeDay(next.date)}`;
      }
    }

    const {
      SELECTED_ADHAN_ENTRIES,
      SAVED_ADHAN_AUDIO_ENTRIES,
      USE_DIFFERENT_ALARM_TYPE,
      BYPASS_DND,
    } = settings.getState();

    let sound: AudioEntry | undefined = undefined;
    if (playSound) {
      sound = SELECTED_ADHAN_ENTRIES['default'] as AudioEntry;
      if (!sound) {
        sound = SAVED_ADHAN_AUDIO_ENTRIES[0] as AudioEntry;
      }
    }

    const adhanOptions: SetAlarmTaskOptions = {
      notifId: ADHAN_NOTIFICATION_ID, // TODO: using same notification id is troublesome when dismissing
      notifChannelId: BYPASS_DND ? ADHAN_DND_CHANNEL_ID : ADHAN_CHANNEL_ID,
      date,
      title,
      body,
      subtitle,
      sound,
      prayer: Prayer.Dhuhr,
      alarmType: USE_DIFFERENT_ALARM_TYPE
        ? AlarmType.SET_EXACT_AND_ALLOW_WHILE_IDLE
        : AlarmType.SET_ALARM_CLOCK,
      dontTurnOnScreen: DONT_TURN_ON_SCREEN,
      vibrationMode: VIBRATION_MODE,
    };

    setAlarmTask(adhanOptions).then(() => {
      ToastAndroid.show('adhan in 10 seconds', ToastAndroid.SHORT);
    });
  }, []);

  const onClearPressed = () => {
    clearCache();
    ToastAndroid.show('Cache cleared', ToastAndroid.SHORT);
  };

  const onVibratePressed = () => vibrate(VibrationMode.ONCE);

  const onVibrateLongPressed = () => {
    ToastAndroid.show('Vibrating for 30 seconds', ToastAndroid.SHORT);
    vibrate(VibrationMode.CONTINUOUS);
    setTimeout(() => vibrateStop(), 30_000);
  };

  return (
    <SafeArea>
      <ScrollView
        p="4"
        _contentContainerStyle={{paddingBottom: 20}}
        mb="3"
        {...props}>
        <HStack alignItems="center" justifyContent="space-between" mb="5">
          <Text>Play adhan in 10 seconds: </Text>
          <Button onPress={scheduleAdhanInTen.bind(null, true)}>
            Schedule
          </Button>
        </HStack>
        <HStack alignItems="center" justifyContent="space-between" mb="5">
          <Text>Show adhan notif in 10 seconds: </Text>
          <Button onPress={scheduleAdhanInTen.bind(null, false)}>
            Schedule
          </Button>
        </HStack>
        <HStack alignItems="center" justifyContent="space-between" mb="5">
          <Text>Clear Calculation Cache: </Text>
          <Button onPress={onClearPressed}>Clear</Button>
        </HStack>
        <HStack alignItems="center" justifyContent="space-between" mb="5">
          <Text>Test vibration: </Text>
          <Button onPress={onVibratePressed}>Vibrate</Button>
          <Button onPress={onVibrateLongPressed}>Vibrate Long</Button>
        </HStack>
        <HStack alignItems="center" justifyContent="space-between" mb="5">
          <Text> </Text>
          <Button onPress={() => vibrateStop()}>Stop Vibration</Button>
        </HStack>
      </ScrollView>
    </SafeArea>
  );
}
