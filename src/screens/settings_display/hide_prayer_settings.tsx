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
import {useCallback} from 'react';
import {ToastAndroid} from 'react-native';
import HidePrayerSetting from './hide_prayer_setting';
import {Prayer, PrayersInOrder} from '@/adhan';
import {useSettings} from '@/store/settings';

export function HidePrayerSettings(props: IStackProps) {
  const [HIDDEN_PRAYERS, setHiddenPrayers] = useSettings('HIDDEN_PRAYERS');

  const onPrayerToggle = useCallback(
    (prayer: Prayer) => {
      const hiddenPrayers = HIDDEN_PRAYERS.slice();
      const indexOfPrayer = hiddenPrayers.indexOf(prayer);
      if (indexOfPrayer === -1) {
        hiddenPrayers.push(prayer);
      } else {
        hiddenPrayers.splice(indexOfPrayer, 1);
      }
      if (hiddenPrayers.length >= PrayersInOrder.length) {
        ToastAndroid.show(
          t`At least one prayer time must be shown`,
          ToastAndroid.SHORT,
        );
        return;
      }
      setHiddenPrayers(hiddenPrayers);
    },
    [HIDDEN_PRAYERS, setHiddenPrayers],
  );

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
        value={HIDDEN_PRAYERS}
        accessibilityLabel={t`is prayer time hidden?`}>
        {PrayersInOrder.map((p, i) => (
          <HidePrayerSetting
            p="2"
            backgroundColor={i % 2 === 0 ? 'coolGray.400:alpha.20' : undefined}
            key={p.toString()}
            prayer={p}
            onToggle={onPrayerToggle}
          />
        ))}
      </Checkbox.Group>
    </VStack>
  );
}
