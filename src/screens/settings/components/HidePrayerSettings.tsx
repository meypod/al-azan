import {i18n} from '@lingui/core';
import {t} from '@lingui/macro';
// import {difference} from 'lodash';
import {
  HStack,
  VStack,
  Text,
  IStackProps,
  Stack,
  Checkbox,
  FormControl,
} from 'native-base';
import {ToastAndroid} from 'react-native';
import {Prayer, PrayersInOrder, prayerTranslations} from '@/adhan';
import {useSettingsHelper} from '@/store/settings';

function HidePrayerSetting({prayer}: {prayer: Prayer}) {
  const prayerName = i18n._(prayerTranslations[prayer.toLowerCase()]);
  return (
    <HStack justifyContent="space-between">
      <Text width="1/2">{prayerName}</Text>

      <Stack width="1/2" justifyContent="center" alignItems="center">
        <Checkbox
          value={prayer}
          accessibilityLabel={t`should ${prayerName} be hidden?`}
        />
      </Stack>
    </HStack>
  );
}

export function HidePrayerSettings(props: IStackProps) {
  const [hiddenPrayer, setHiddenPrayers] = useSettingsHelper('HIDDEN_PRAYERS');

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
      <Text textAlign="justify">{t`You can hide any prayer times you don't want to see in the main screen here:`}</Text>
      <HStack>
        <Text width="1/2" textAlign="left">{t`Prayer Time`}</Text>
        <Text width="1/2" textAlign="center">{t`Hidden?`}</Text>
      </HStack>
      <Checkbox.Group
        onChange={setHiddenPrayersProxy}
        value={hiddenPrayer}
        accessibilityLabel="prayer hidden status">
        {PrayersInOrder.map(p => (
          <HidePrayerSetting key={p.toString()} prayer={p} />
        ))}
      </Checkbox.Group>
    </VStack>
  );
}
