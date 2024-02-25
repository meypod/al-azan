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
import {memo, useCallback} from 'react';
import {Pressable, ToastAndroid} from 'react-native';
import {Prayer, PrayersInOrder, translatePrayer} from '@/adhan';
import {useSettings} from '@/store/settings';

const HideWidgetPrayerSetting = memo(function HideWidgetPrayerSetting({
  prayer,
  onToggle,
  ...props
}: {prayer: Prayer; onToggle: (prayer: Prayer) => void} & IStackProps) {
  const prayerName = translatePrayer(prayer);

  const toggle = () => onToggle(prayer);

  return (
    <Pressable onPress={toggle}>
      <HStack {...props} justifyContent="space-between">
        <Text width="1/2">{prayerName}</Text>

        <Stack
          width="1/2"
          justifyContent="center"
          alignItems="center"
          pointerEvents="none">
          <Checkbox
            size="md"
            value={prayer}
            accessibilityLabel={t`should ${prayerName} be hidden?`}
            isReadOnly={true}
          />
        </Stack>
      </HStack>
    </Pressable>
  );
});

export function HideWidgetPrayerSettings(props: IStackProps) {
  const [hiddenWidgetPrayer, setHiddenWidgetPrayers] = useSettings(
    'HIDDEN_WIDGET_PRAYERS',
  );

  const onPrayerToggle = useCallback(
    (prayer: Prayer) => {
      const indexOfPrayer = hiddenWidgetPrayer.indexOf(prayer);
      const hiddenPrayers = hiddenWidgetPrayer.slice();
      if (indexOfPrayer === -1) {
        hiddenPrayers.push(prayer);
      } else {
        hiddenPrayers.splice(indexOfPrayer, 1);
      }
      if (hiddenPrayers.length < 3) {
        ToastAndroid.show(
          t`Only six items can be shown at the same time`,
          ToastAndroid.SHORT,
        );
        return;
      }
      setHiddenWidgetPrayers(hiddenPrayers);
    },
    [setHiddenWidgetPrayers, hiddenWidgetPrayer],
  );

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
        value={hiddenWidgetPrayer}
        accessibilityLabel={t`is prayer time hidden?`}>
        {PrayersInOrder.map((p, i) => (
          <HideWidgetPrayerSetting
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
