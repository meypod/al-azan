import {t} from '@lingui/macro';
// import {difference} from 'lodash';
import {
  HStack,
  VStack,
  Text,
  Checkbox,
  FormControl,
  IStackProps,
} from 'native-base';
import {ToastAndroid} from 'react-native';
import HidePrayerSetting from './hide_prayer_setting';
import {Prayer, PrayersInOrder} from '@/adhan';
import {useSettings} from '@/store/settings';

export function HidePrayerSettings(props: IStackProps) {
  const [hiddenPrayer, setHiddenPrayers] = useSettings('HIDDEN_PRAYERS');

  const setHiddenPrayersProxy = (hiddenPrayers: Prayer[]) => {
    if (hiddenPrayers.length >= PrayersInOrder.length) {
      ToastAndroid.show(
        t`At least one prayer time must be shown`,
        ToastAndroid.SHORT,
      );
      return;
    }
    setHiddenPrayers(hiddenPrayers);
  };

  return (
    <VStack
      alignItems="stretch"
      justifyContent="center"
      space="sm"
      mb="3"
      {...props}>
      <FormControl.Label>{t`Hide Prayer Times`}:</FormControl.Label>
      <Text>{t`You can hide prayer times you don't want to see in the main screen here:`}</Text>
      <HStack p="2">
        <Text width="1/2" textAlign="left">{t`Time`}</Text>
        <Text width="1/2" textAlign="center">{t`Hidden?`}</Text>
      </HStack>
      <Checkbox.Group
        onChange={setHiddenPrayersProxy}
        value={hiddenPrayer}
        accessibilityLabel={t`is prayer time hidden?`}>
        {PrayersInOrder.map((p, i) => (
          <HidePrayerSetting
            p="2"
            backgroundColor={i % 2 === 0 ? 'coolGray.400:alpha.20' : undefined}
            key={p.toString()}
            prayer={p}
          />
        ))}
      </Checkbox.Group>
    </VStack>
  );
}
