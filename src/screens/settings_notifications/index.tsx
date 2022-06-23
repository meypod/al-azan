import {t} from '@lingui/macro';
import {
  HStack,
  ScrollView,
  Text,
  IScrollViewProps,
  FormControl,
  Slider,
} from 'native-base';
import {PrayersInOrder} from '@/adhan';
import {NotificationSetting} from '@/screens/settings_notifications/notification_setting';
import {useSettingsHelper} from '@/store/settings';
import {formatNumber} from '@/utils/numbers';

export function NotificationSettings(props: IScrollViewProps) {
  const [adhanVolume, setAdhanVolume] = useSettingsHelper('ADHAN_VOLUME');

  return (
    <ScrollView
      p="4"
      mb="3"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      {...props}>
      <HStack justifyContent="space-between">
        <Text width="1/3">{t`Adhan`}</Text>
        <Text width="1/3" textAlign="center">
          {t`Notification`}
        </Text>
        <Text width="1/6" textAlign="center">
          {t`Sound`}
        </Text>
      </HStack>
      {PrayersInOrder.map(p => (
        <NotificationSetting key={p.toString()} prayer={p} />
      ))}

      <FormControl display="flex" mt="8">
        <FormControl.Label>{t`Sound Volume`}</FormControl.Label>
        <FormControl.HelperText mb="3">
          <Text textAlign="justify" fontSize="sm">
            {t`Note that you can still decrease volume of the Adhan while It's playing using the phone volume buttons.`}
          </Text>
        </FormControl.HelperText>
        <HStack alignItems="center" justifyContent="center">
          <Text>{t`Volume`}: </Text>
          <Text>{formatNumber(adhanVolume)}</Text>
        </HStack>
        <HStack flexWrap="nowrap" flexDir="row">
          <Text mx="2">{formatNumber(0)}</Text>
          <Slider
            m="0"
            flexShrink={1}
            onChangeEnd={n => setAdhanVolume(Math.floor(n))}
            defaultValue={adhanVolume}
            colorScheme="emerald"
            size="lg">
            <Slider.Track>
              <Slider.FilledTrack />
            </Slider.Track>
            <Slider.Thumb />
          </Slider>
          <Text mx="2">{formatNumber(100)}</Text>
        </HStack>
      </FormControl>
    </ScrollView>
  );
}
