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
import {Prayer, PrayersInOrder, translatePrayer} from '@/adhan';
import {useSettings} from '@/store/settings';

function HideWidgetPrayerSetting({
  prayer,
  ...props
}: {prayer: Prayer} & IStackProps) {
  const prayerName = translatePrayer(prayer);
  return (
    <HStack {...props} justifyContent="space-between">
      <Text width="1/2">{prayerName}</Text>

      <Stack width="1/2" justifyContent="center" alignItems="center">
        <Checkbox
          size="md"
          value={prayer}
          accessibilityLabel={t`should ${prayerName} be hidden?`}
        />
      </Stack>
    </HStack>
  );
}

export function HideWidgetPrayerSettings(props: IStackProps) {
  const [hiddenWidgetPrayer, setHiddenWidgetPrayers] = useSettings(
    'HIDDEN_WIDGET_PRAYERS',
  );

  const setHiddenPrayersProxy = (hiddenPrayers: Prayer[]) => {
    if (hiddenPrayers.length < 3) {
      ToastAndroid.show(
        t`Only six items can be shown at the same time`,
        ToastAndroid.SHORT,
      );
      return;
    }
    setHiddenWidgetPrayers(hiddenPrayers);
  };

  return (
    <VStack
      alignItems="stretch"
      justifyContent="center"
      space="sm"
      mb="3"
      {...props}>
      <FormControl.Label>{t`Hide Prayer Times`}:</FormControl.Label>
      <Text>{t`You can hide prayer times you don't want to see in the widget here:`}</Text>
      <HStack p="2">
        <Text width="1/2" textAlign="left">{t`Time`}</Text>
        <Text width="1/2" textAlign="center">{t`Hidden?`}</Text>
      </HStack>
      <Checkbox.Group
        onChange={setHiddenPrayersProxy}
        value={hiddenWidgetPrayer}
        accessibilityLabel={t`is prayer time hidden?`}>
        {PrayersInOrder.map((p, i) => (
          <HideWidgetPrayerSetting
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
